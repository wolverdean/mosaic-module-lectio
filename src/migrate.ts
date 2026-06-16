import type { ModuleDb } from '@mosaic/sdk'

export function migrate(db: ModuleDb): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS lectio_journal_entries (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date             TEXT NOT NULL,
      content          TEXT NOT NULL DEFAULT '',
      original_content TEXT,
      updated_at       TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, date)
    )
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS lectio_reading_cache (
      key        TEXT PRIMARY KEY,
      content    TEXT NOT NULL,
      fetched_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS lectio_contemplative_reflections (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date        TEXT NOT NULL,
      passage_id  TEXT NOT NULL DEFAULT '',
      source      TEXT NOT NULL DEFAULT '',
      reflection  TEXT NOT NULL DEFAULT '',
      updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, date)
    )
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS lectio_weekly_reviews (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      week_start TEXT NOT NULL,
      week_end   TEXT NOT NULL,
      content    TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, week_end)
    )
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS lectio_user_settings (
      user_id               INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      readings_source       TEXT NOT NULL DEFAULT 'local',
      retreat_start         TEXT,
      retreat_paused        INTEGER NOT NULL DEFAULT 0,
      retreat_paused_days   INTEGER,
      retreat18_start       TEXT,
      retreat18_paused      INTEGER NOT NULL DEFAULT 0,
      retreat18_paused_days INTEGER
    )
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS lectio_intercessions (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name       TEXT NOT NULL,
      intention  TEXT,
      active     INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)

  db.exec(`
    CREATE INDEX IF NOT EXISTS lectio_intercessions_user
      ON lectio_intercessions(user_id, active, sort_order)
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS lectio_prayers (
      id         TEXT PRIMARY KEY,
      title      TEXT NOT NULL,
      body       TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0
    )
  `)

  const seedPrayer = db.prepare('INSERT OR IGNORE INTO lectio_prayers (id, title, body, sort_order) VALUES (?, ?, ?, ?)')
  const builtinPrayers: [string, string, string, number][] = [
    ['our-father',           'Our Father',                    "Our Father, who art in heaven,\nhallowed be thy name;\nthy kingdom come;\nthy will be done on earth as it is in heaven.\nGive us this day our daily bread;\nand forgive us our trespasses\nas we forgive those who trespass against us;\nand lead us not into temptation,\nbut deliver us from evil.\nAmen.", 10],
    ['glory-be',             'Glory Be',                      "Glory be to the Father,\nand to the Son,\nand to the Holy Spirit.\nAs it was in the beginning,\nis now, and ever shall be,\nworld without end.\nAmen.", 20],
    ['guardian-angel',       'Prayer to Your Guardian Angel', "Angel of God, my guardian dear,\nto whom God's love commits me here,\never this day be at my side,\nto light and guard, to rule and guide.\nAmen.", 30],
    ['apostles-creed',       "Apostles' Creed",               "I believe in God, the Father Almighty,\nCreator of heaven and earth;\nand in Jesus Christ, His only Son, our Lord;\nwho was conceived by the Holy Spirit,\nborn of the Virgin Mary,\nsuffered under Pontius Pilate,\nwas crucified, died, and was buried.\nHe descended into hell;\nthe third day He rose again from the dead;\nHe ascended into heaven,\nand is seated at the right hand of God the Father Almighty;\nfrom thence He shall come to judge the living and the dead.\nI believe in the Holy Spirit,\nthe Holy Catholic Church,\nthe communion of Saints,\nthe forgiveness of sins,\nthe resurrection of the body,\nand life everlasting.\nAmen.", 40],
    ['act-of-contrition',    'Act of Contrition',             "O my God, I am heartily sorry for having offended Thee,\nand I detest all my sins because of Thy just punishments,\nbut most of all because they offend Thee, my God,\nwho art all good and deserving of all my love.\nI firmly resolve, with the help of Thy grace,\nto sin no more and to avoid the near occasions of sin.\nAmen.", 50],
    ['acts-faith-hope-love', 'Acts of Faith, Hope & Love',    "ACT OF FAITH\nO my God, I firmly believe that Thou art one God in three divine Persons,\nFather, Son, and Holy Spirit.\nI believe that Thy divine Son became man and died for our sins,\nand that He will come to judge the living and the dead.\nI believe these and all the truths which the holy Catholic Church teaches,\nbecause Thou hast revealed them, who canst neither deceive nor be deceived.\nAmen.\n\nACT OF HOPE\nO my God, relying on Thy almighty power and infinite mercy and promises,\nI hope to obtain pardon of my sins, the help of Thy grace,\nand life everlasting, through the merits of Jesus Christ,\nmy Lord and Redeemer.\nAmen.\n\nACT OF LOVE\nO my God, I love Thee above all things, with my whole heart and soul,\nbecause Thou art all good and worthy of all love.\nI love my neighbor as myself for the love of Thee.\nI forgive all who have injured me and ask pardon of all whom I have injured.\nAmen.", 60],
    ['divine-mercy',         'Divine Mercy Chaplet',          "Begin with the Our Father, Hail Mary, and Apostles' Creed.\n\nOn the large beads say:\nEternal Father, I offer You the Body and Blood, Soul and Divinity\nof Your dearly beloved Son, Our Lord Jesus Christ,\nin atonement for our sins and those of the whole world.\n\nOn the small beads say (10 times per decade):\nFor the sake of His sorrowful Passion,\nhave mercy on us and on the whole world.\n\nConclude with (3 times):\nHoly God, Holy Mighty One, Holy Immortal One,\nhave mercy on us and on the whole world.", 70],
    ['tantum-ergo',          'Tantum Ergo',                   "Tantum ergo Sacramentum\nVeneremur cernui:\nEt antiquum documentum\nNovo cedat ritui:\nPraestet fides supplementum\nSensuum defectui.\n\nGenitori, Genitoque\nLaus et jubilatio,\nSalus, honor, virtus quoque\nSit et benedictio:\nProcedenti ab utroque\nCompar sit laudatio.\nAmen.\n\n—\n\nDown in adoration falling,\nLo! the Sacred Host we hail;\nLo! o'er ancient forms departing,\nNewer rites of grace prevail;\nFaith for all defects supplying,\nWhere the feeble senses fail.\n\nTo the everlasting Father,\nAnd the Son who reigns on high,\nWith the Holy Ghost proceeding\nForth from each eternally,\nBe salvation, honor, blessing,\nMight and endless majesty.\nAmen.", 80],
    ['before-crucifix',      'Prayer Before a Crucifix',      "Look down upon me, good and gentle Jesus,\nwhile before Thy face I humbly kneel,\nand with burning soul pray and beseech Thee\nto fix deep in my heart lively sentiments\nof faith, hope, and charity,\ntrue contrition for my sins,\nand a firm purpose of amendment;\nwhile I contemplate with great love and tender pity\nThy five wounds, pondering over them within me,\ncalling to mind the words which David Thy prophet said of Thee, my good Jesus:\n\"They have pierced my hands and my feet;\nthey have numbered all my bones.\"", 90],
    ['suscipe',              'Suscipe',                       "Take, Lord, and receive all my liberty,\nmy memory, my understanding,\nand my entire will,\nall I have and call my own.\nYou have given all to me.\nTo you, Lord, I return it.\nEverything is yours; do with it what you will.\nGive me only your love and your grace,\nthat is enough for me.\nAmen.", 100],
    ['prayer-for-generosity','Prayer for Generosity',         "Lord, teach me to be generous.\nTeach me to serve you as you deserve;\nto give and not to count the cost,\nto fight and not to heed the wounds,\nto toil and not to seek for rest,\nto labor and not to ask for reward,\nsave that of knowing that I do your will.\nAmen.\n— St. Ignatius of Loyola", 110],
    ['anima-christi',        'Anima Christi',                 "Soul of Christ, sanctify me.\nBody of Christ, save me.\nBlood of Christ, inebriate me.\nWater from the side of Christ, wash me.\nPassion of Christ, strengthen me.\nO good Jesus, hear me.\nWithin your wounds hide me.\nDo not permit me to be separated from you.\nFrom the malicious enemy defend me.\nIn the hour of my death call me\nand bid me come to you,\nthat with your saints I may praise you\nfor ever and ever.\nAmen.", 120],
  ]
  for (const [id, title, body, sort_order] of builtinPrayers) {
    seedPrayer.run(id, title, body, sort_order)
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS lectio_user_prayers (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title      TEXT    NOT NULL CHECK(length(trim(title)) > 0),
      body       TEXT    NOT NULL CHECK(length(trim(body))  > 0),
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
    )
  `)
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_lectio_user_prayers_user
      ON lectio_user_prayers(user_id, sort_order, id)
  `)
}
