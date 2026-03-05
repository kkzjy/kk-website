const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = 3000;
const visitThrottle = new Map();

function getChinaDateString() {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' });
}

function getClientIp(req) {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.length > 0) {
        return forwarded.split(',')[0].trim();
    }
    return req.ip || req.socket?.remoteAddress || 'unknown';
}

function queryVisitStats(callback) {
    const today = getChinaDateString();
    db.get(
        'SELECT count FROM visit_stats WHERE visit_date = ?',
        [today],
        (todayErr, todayRow) => {
            if (todayErr) {
                return callback(todayErr);
            }
            db.get(
                'SELECT COALESCE(SUM(count), 0) AS total FROM visit_stats',
                [],
                (totalErr, totalRow) => {
                    if (totalErr) {
                        return callback(totalErr);
                    }
                    callback(null, {
                        date: today,
                        todayCount: todayRow ? todayRow.count : 0,
                        totalCount: totalRow ? totalRow.total : 0
                    });
                }
            );
        }
    );
}

function seedLobsterPostsIfEmpty() {
    db.get('SELECT COUNT(*) AS count FROM lobster_posts', [], (err, row) => {
        if (err) {
            console.error('查询lobster_posts数量失败:', err.message);
            return;
        }

        if (row && row.count > 0) {
            return;
        }

        const seedPosts = [
            {
                title: '最近在忙里找平衡',
                post_date: '2026-03-05',
                content: '最近项目改动比较密集，白天推进功能，晚上回头补细节。慢慢意识到效率不是一直冲，而是把节奏稳住。'
            },
            {
                title: '关于“想做”和“该做”',
                post_date: '2026-03-03',
                content: '有些事情是热爱驱动，有些事情是责任驱动。最近在练习把两者放在同一条路上，而不是对立起来。'
            },
            {
                title: '给自己的一个小提醒',
                post_date: '2026-03-01',
                content: '别急着证明自己，先把每一件小事做扎实。真正的底气，通常都来自那些没人看到的积累。'
            }
        ];

        const stmt = db.prepare('INSERT INTO lobster_posts (title, content, post_date) VALUES (?, ?, ?)');
        seedPosts.forEach((post) => {
            stmt.run([post.title, post.content, post.post_date]);
        });
        stmt.finalize((finalErr) => {
            if (finalErr) {
                console.error('初始化龙虾心事数据失败:', finalErr.message);
            } else {
                console.log('✅ 龙虾心事默认数据初始化完成');
            }
        });
    });
}

// 创建SQLite数据库
const db = new sqlite3.Database('./guestbook.db', (err) => {
    if (err) {
        console.error('数据库连接错误:', err.message);
    } else {
        console.log('✅ 成功连接到SQLite数据库');
        initDatabase();
    }
});

// 初始化数据库
function initDatabase() {
    db.run(`
        CREATE TABLE IF NOT EXISTS guestbook (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            message TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('创建表失败:', err.message);
        } else {
            console.log('✅ guestbook表创建成功或已存在');
        }
    });

    db.run(`
        CREATE TABLE IF NOT EXISTS visit_stats (
            visit_date TEXT PRIMARY KEY,
            count INTEGER NOT NULL DEFAULT 0,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('创建visit_stats表失败:', err.message);
        } else {
            console.log('✅ visit_stats表创建成功或已存在');
        }
    });

    db.run(`
        CREATE TABLE IF NOT EXISTS lobster_posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            post_date TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('创建lobster_posts表失败:', err.message);
        } else {
            console.log('✅ lobster_posts表创建成功或已存在');
            seedLobsterPostsIfEmpty();
        }
    });
}

// 留言板API
app.get('/api/guestbook', (req, res) => {
    const query = 'SELECT * FROM guestbook ORDER BY created_at DESC LIMIT 50';
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('查询留言失败:', err.message);
            return res.status(500).json({ error: '查询留言失败' });
        }
        res.json({
            messages: rows,
            count: rows.length
        });
    });
});

app.post('/api/guestbook', express.json(), (req, res) => {
    const { name, message } = req.body;
    
    if (!name || !message) {
        return res.status(400).json({ error: '姓名和留言内容不能为空' });
    }

    // 验证输入长度
    if (name.length > 50 || message.length > 1000) {
        return res.status(400).json({ error: '姓名或留言内容过长' });
    }

    const query = 'INSERT INTO guestbook (name, message) VALUES (?, ?)';
    db.run(query, [name, message], function(err) {
        if (err) {
            console.error('插入留言失败:', err.message);
            return res.status(500).json({ error: '保存留言失败' });
        }

        // 获取刚插入的留言
        db.get('SELECT * FROM guestbook WHERE id = ?', [this.lastID], (err, row) => {
            if (err) {
                console.error('查询刚插入的留言失败:', err.message);
                return res.status(500).json({ error: '查询留言失败' });
            }

            res.json({ 
                success: true, 
                message: '留言成功', 
                data: row 
            });
        });
    });
});

// 删除留言（管理员功能）
app.delete('/api/guestbook/:id', (req, res) => {
    const id = req.params.id;
    
    db.run('DELETE FROM guestbook WHERE id = ?', [id], function(err) {
        if (err) {
            console.error('删除留言失败:', err.message);
            return res.status(500).json({ error: '删除留言失败' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: '留言不存在' });
        }

        res.json({ success: true, message: '删除成功' });
    });
});

// 统计留言数量
app.get('/api/guestbook/stats', (req, res) => {
    db.get('SELECT COUNT(*) as count FROM guestbook', [], (err, row) => {
        if (err) {
            console.error('统计留言失败:', err.message);
            return res.status(500).json({ error: '统计留言失败' });
        }
        res.json({ count: row.count });
    });
});

// 龙虾心事：读取文章列表（按日期倒序）
app.get('/api/lobster-posts', (req, res) => {
    const query = `
        SELECT id, title, content, post_date, created_at
        FROM lobster_posts
        ORDER BY post_date DESC, id DESC
        LIMIT 100
    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('查询龙虾心事失败:', err.message);
            return res.status(500).json({ error: '查询龙虾心事失败' });
        }

        res.json({
            posts: rows,
            count: rows.length
        });
    });
});

// 访问统计：读取今日和总访问数
app.get('/api/visits', (req, res) => {
    queryVisitStats((err, stats) => {
        if (err) {
            console.error('查询访问统计失败:', err.message);
            return res.status(500).json({ error: '查询访问统计失败' });
        }
        res.json(stats);
    });
});

// 访问统计：记录一次访问（同IP 30秒内只计一次）
app.post('/api/visits/track', (req, res) => {
    const today = getChinaDateString();
    const ip = getClientIp(req);
    const key = `${today}|${ip}`;
    const now = Date.now();
    const lastHitAt = visitThrottle.get(key) || 0;

    if (now - lastHitAt < 30 * 1000) {
        return queryVisitStats((err, stats) => {
            if (err) {
                console.error('查询访问统计失败:', err.message);
                return res.status(500).json({ error: '查询访问统计失败' });
            }
            res.json({
                counted: false,
                ...stats
            });
        });
    }

    visitThrottle.set(key, now);
    db.run(
        `
        INSERT INTO visit_stats (visit_date, count, updated_at)
        VALUES (?, 1, CURRENT_TIMESTAMP)
        ON CONFLICT(visit_date)
        DO UPDATE SET count = count + 1, updated_at = CURRENT_TIMESTAMP
        `,
        [today],
        (err) => {
            if (err) {
                console.error('记录访问失败:', err.message);
                return res.status(500).json({ error: '记录访问失败' });
            }
            queryVisitStats((statsErr, stats) => {
                if (statsErr) {
                    console.error('查询访问统计失败:', statsErr.message);
                    return res.status(500).json({ error: '查询访问统计失败' });
                }
                res.json({
                    counted: true,
                    ...stats
                });
            });
        }
    );
});

// 健康检查
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        database: 'SQLite (guestbook.db)'
    });
});

// 关于API - 个人详细信息
app.get('/api/about', (req, res) => {
    res.json({
        name: 'kk哥',
        nickname: 'kk哥',
        personality: {
            socialMode: '陌生人面前内向，好朋友面前外向',
            selfEvaluation: '比较幽默',
            friendEvaluation: '又帅又幽默',
            advantages: '佛系随和',
            lifePhilosophy: '爱咋咋地老子最吊'
        },
        hobbies: ['苦逼牛马'],
        lifestyle: {
            schedule: '两点一线（上班下班）',
            workStatus: '苦逼牛马（自嘲）',
            environmentPreference: '自然环境好的地方'
        },
        relationships: {
            friend1: {
                name: '莫总',
                nickname: '人生导师（装逼版）',
                appearance: '高高瘦瘦帅帅的',
                personality: '严肃的搞笑担当',
                role: '发小、千万级别抖音商家账号操盘手、人生导师',
                relationship: '玩得很好，认识13年',
                funnyStory: '今年过年到kk哥家做客，kk哥妈妈跟他唠家常时发现他居然要叫kk哥妈妈叫"姐"，连莫总自己都不相信，让kk哥很难绷'
            },
            friend2: {
                name: '啊猪（死人猪）',
                nickname: '死人猪（原名：小猪）',
                appearance: '稀疏（秃顶）、瘦子一个',
                personality: '闷骚怪',
                characteristics: '倒霉鬼（每次跟他出门就没有好事情发生）',
                nicknameOrigin: '姓朱，刚认识时叫"小猪"，熟了就叫"死人猪"',
                singing: '唱歌好听，但比kk哥差多了',
                meetingFrequency: '一年难见一面',
                relationship: '比较损的朋友',
                commonInterest: '都喜欢唱歌'
            }
        },
        values: {
            mostImportant: '自由',
            dream: '财富自由，可以尽情做自己想做的事',
            lifePhilosophy: '爱咋咋地老子最吊'
        },
        aesthetic: {
            colors: ['黑白配色'],
            style: '极简又高级'
        },
        created: '2026-03-01',
        aiAssistant: '小助手 (OpenClaw + xiaomi/mimo-v2-flash)'
    });
});

// 损友语录API
app.get('/api/roasts', (req, res) => {
    res.json({
        roasts: [
            {
                target: '莫总',
                quote: '我今年25岁，应该叫你妈叫姐',
                context: '过年到kk哥家做客时说的'
            },
            {
                target: '啊猪',
                quote: '我今天又倒霉了，出门踩狗屎',
                context: '倒霉鬼的日常'
            },
            {
                target: 'kk哥',
                quote: '你们两个，一个装逼，一个倒霉',
                context: '对两位损友的评价'
            },
            {
                target: 'kk哥',
                quote: '莫总，你还是叫我妈叫阿姨吧',
                context: '辈分纠正'
            },
            {
                target: 'kk哥',
                quote: '死人猪，你今天又踩狗屎了吗？',
                context: '日常关心'
            },
            {
                target: 'kk哥',
                quote: '秃顶不是你的错，但唱歌比我差就是你的不对了！',
                context: '唱歌水平鉴定'
            }
        ]
    });
});

// 损友详细信息API
app.get('/api/friends', (req, res) => {
    res.json({
        friends: [
            {
                name: '莫总',
                nickname: '人生导师（装逼版）',
                appearance: '高高瘦瘦帅帅的',
                personality: '严肃的搞笑担当',
                tags: ['高高瘦瘦帅帅', '严肃搞笑', '千万级操盘手', '13年老友'],
                stories: [
                    {
                        title: '年度最佳笑料：叫我妈叫姐',
                        content: '今年过年他来我家做客，我妈跟他唠家常时，我妈发现他居然要叫我妈叫"姐"！更搞笑的是，连莫总自己都不相信，我当时就很难绷，这辈分乱得我都想叫他"叔"了。'
                    },
                    {
                        title: '人生导师的日常',
                        content: '平时总是一副"我懂人生"的样子，结果过年连辈分都搞不清楚。这就是千万级操盘手的真实水平？'
                    }
                ],
                rating: {
                   装逼指数: 5,
                   搞笑指数: 4,
                   靠谱指数: 5,
                    总分: 8
                }
            },
            {
                name: '啊猪（死人猪）',
                nickname: '死人猪（原名：小猪）',
                appearance: '稀疏（秃顶）、瘦子一个',
                personality: '闷骚怪',
                tags: ['秃顶稀疏', '闷骚怪', '倒霉鬼', '唱歌比我差'],
                stories: [
                    {
                        title: '唱歌水平鉴定',
                        content: '唱歌确实好听，但比我差多了。每次KTV我都是麦霸，他只能在旁边默默伴唱。'
                    },
                    {
                        title: '倒霉鬼的日常',
                        content: '每次跟他出门，不是丢东西就是遇倒霉事。我怀疑他是不是水逆体质，建议他天天看黄历。'
                    },
                    {
                        title: '见面频率',
                        content: '一年难见一面，每次见面都像是"久别重逢"。不过虽然见面少，但损友的感情还在。'
                    }
                ],
                rating: {
                   倒霉指数: 5,
                   闷骚指数: 5,
                   唱歌指数: 3,
                    总分: 6
                }
            }
        ]
    });
});

// 损友对比API
app.get('/api/comparison', (req, res) => {
    res.json({
        comparison: {
            莫总: {
                装逼指数: '⭐⭐⭐⭐⭐',
                搞笑指数: '⭐⭐⭐⭐',
                靠谱指数: '⭐⭐⭐⭐⭐',
                总分: '8/10'
            },
            啊猪: {
                倒霉指数: '⭐⭐⭐⭐⭐',
                闷骚指数: '⭐⭐⭐⭐⭐',
                唱歌指数: '⭐⭐⭐',
                总分: '6/10'
            }
        }
    });
});

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

// 404处理
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 kk哥的博客正在运行`);
    console.log(`📍 访问地址: http://localhost:${PORT}`);
    console.log(`🌐 公网访问: http://101.37.105.81:${PORT}`);
    console.log(`⏰ 启动时间: ${new Date().toLocaleString('zh-CN')}`);
    console.log(`\n📋 页面功能:`);
    console.log(`   - 个人博客风格`);
    console.log(`   - 损友内容隐藏（需要输入外号解锁）`);
    console.log(`   - 留言板块（SQLite数据库持久化存储）`);
    console.log(`   - 黑白配色极简高级风格`);
    console.log(`\n🔧 API接口:`);
    console.log(`   - /health - 健康检查`);
    console.log(`   - /api/about - 个人详细信息`);
    console.log(`   - /api/roasts - 损友语录`);
    console.log(`   - /api/friends - 损友详细信息`);
    console.log(`   - /api/comparison - 损友对比`);
    console.log(`   - /api/guestbook - 留言板（GET/POST）`);
    console.log(`   - /api/guestbook/stats - 留言统计`);
    console.log(`   - /api/guestbook/:id - 删除留言`);
    console.log(`   - /api/lobster-posts - 龙虾心事列表`);
    console.log(`   - /api/visits - 获取访问统计`);
    console.log(`   - /api/visits/track - 记录访问`);
    console.log(`\n💾 数据库: SQLite (guestbook.db)`);
});
