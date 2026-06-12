// 19th Annotation — Retreat in Everyday Life (30 weeks)
// Based on the Spiritual Exercises of St. Ignatius of Loyola (1548, public domain)
// Structure: 5 prayer days per week (days 1-5); days 6-7 are rest and review.

const PHASES = {
  FOUNDATION: 'Foundation',
  FIRST_WEEK: 'First Week',
  SECOND_WEEK: 'Second Week',
  THIRD_WEEK: 'Third Week',
  FOURTH_WEEK: 'Fourth Week',
};

// Each week: { week, phase, title, grace, background, days[] }
// Each day:  { day, title, scripture, reflection }

const schedule = [
  // ─── FOUNDATION ──────────────────────────────────────────────────────────────
  {
    week: 1, phase: PHASES.FOUNDATION,
    title: 'Created for Love',
    grace: 'Lord, help me to know in my heart that I am made by you and for you.',
    background: 'The Principle and Foundation opens the retreat: we are created to praise, reverence, and serve God, and by doing so to save our soul. Everything else on earth is given to help us reach that end.',
    days: [
      { day: 1, title: 'Made in God\'s Image', scripture: 'Genesis 1:26-31', reflection: 'Sit quietly and let the words "God saw that it was very good" rest on you. How does it feel to know you are the deliberate work of a loving Creator?' },
      { day: 2, title: 'Known Before Birth', scripture: 'Jeremiah 1:4-8', reflection: 'God knew you before you were formed. What does it stir in you to be personally known and chosen by God?' },
      { day: 3, title: 'The Beloved', scripture: 'Isaiah 43:1-7', reflection: '"I have called you by name; you are mine." Let those words sink in slowly. Where in your life do you most need to hear them?' },
      { day: 4, title: 'Purpose and Direction', scripture: 'Psalm 8', reflection: 'In what areas of your life do you feel most aligned with being made for God? Where do you feel most off course?' },
      { day: 5, title: 'Using Creatures Well', scripture: 'Romans 8:28-30', reflection: 'Ignatius teaches that all created things are to be used insofar as they help us toward our end. Where might a good thing be pulling you away from God?' },
    ],
  },
  {
    week: 2, phase: PHASES.FOUNDATION,
    title: 'Finding God in All Things',
    grace: 'Lord, open my eyes to your presence in my ordinary life.',
    background: 'Ignatius believed God is active in all creation and in the movements of our inner life. Before the retreat deepens, we practice "finding God in all things" — the cornerstone of Ignatian spirituality.',
    days: [
      { day: 1, title: 'A God Who Speaks', scripture: '1 Kings 19:9-13', reflection: 'Elijah heard God in the still small voice, not the earthquake or fire. Where do you most easily hear God? Where do you tend not to listen?' },
      { day: 2, title: 'God in Creation', scripture: 'Psalm 19:1-6', reflection: 'Go outside or sit by a window. What in creation is speaking to you today about the Creator?' },
      { day: 3, title: 'The Examen — Looking Back', scripture: 'Lamentations 3:22-26', reflection: 'Review your day. Where did you sense life, light, love? Where did you feel distant from God? This is Ignatius\'s Examen — the daily prayer of noticing.' },
      { day: 4, title: 'Interior Movements', scripture: 'Galatians 5:16-25', reflection: 'The Spiritual Exercises attend closely to what draws us toward God (consolation) and what draws us away (desolation). What interior movements do you notice today?' },
      { day: 5, title: 'Radical Availability', scripture: 'Luke 1:38', reflection: '"Let it be done to me according to your word." Mary models complete openness. What would it mean to hold your life with that kind of openness before God?' },
    ],
  },

  // ─── FIRST WEEK ──────────────────────────────────────────────────────────────
  {
    week: 3, phase: PHASES.FIRST_WEEK,
    title: 'Gratitude for God\'s Gifts',
    grace: 'Lord, grant me a deep, felt sense of gratitude for all you have given me.',
    background: 'The First Week begins with remembering what we have received before confronting what has gone wrong. Ignatius wants us to feel loved before we face our failures — the order matters.',
    days: [
      { day: 1, title: 'Counting Gifts', scripture: 'Psalm 103:1-18', reflection: 'Make an unhurried list of everything you are grateful for — large and small. Let gratitude become a prayer.' },
      { day: 2, title: 'The Father Running', scripture: 'Luke 15:11-24', reflection: 'The father sees his son "while he was still a long way off." When have you experienced God meeting you before you arrived?' },
      { day: 3, title: 'Every Good Gift', scripture: 'James 1:16-18', reflection: 'Every good thing in your life comes from the Father of lights. Spend time tracing the good in your life back to God.' },
      { day: 4, title: 'Gratitude and Memory', scripture: 'Deuteronomy 8:2-6', reflection: 'Israel is told to remember. What is your story of God\'s faithfulness? Take time to remember the key moments.' },
      { day: 5, title: 'The One Who Returned', scripture: 'Luke 17:11-19', reflection: 'Only one leper returned to give thanks. What draws us away from gratitude? What would it take to return more consistently?' },
    ],
  },
  {
    week: 4, phase: PHASES.FIRST_WEEK,
    title: 'The Reality of Sin in the World',
    grace: 'Lord, let me see with clear eyes the presence of sin in the world, without despair.',
    background: 'Ignatius invites us to consider sin in history — the angels who fell, Adam and Eve, and the effects of accumulated human sin. This is not to discourage but to understand the world Jesus entered and why he came.',
    days: [
      { day: 1, title: 'The Fall and Its Echo', scripture: 'Genesis 3:1-13', reflection: 'Notice the patterns in the Fall: doubt, grasping, blame. Where do you see these patterns in the world today? In yourself?' },
      { day: 2, title: 'The Broken World', scripture: 'Romans 1:18-25', reflection: 'Paul describes a world that has exchanged the truth for a lie. Where do you see this exchange most painfully in our culture?' },
      { day: 3, title: 'Systemic Sin', scripture: 'Amos 5:21-24', reflection: 'Prophets like Amos addressed structural injustice, not just personal sin. What systems around you cause harm? How are you part of them?' },
      { day: 4, title: 'The Weight of History', scripture: 'Psalm 79:1-9', reflection: 'This psalm cries out under the weight of what has been done. Allow yourself to grieve honestly before God over something broken in the world.' },
      { day: 5, title: 'God Does Not Abandon', scripture: 'Isaiah 49:14-16', reflection: '"Can a mother forget her infant? Even if she might, I will not forget you." In the face of a broken world, what does it mean that God\'s love holds firm?' },
    ],
  },
  {
    week: 5, phase: PHASES.FIRST_WEEK,
    title: 'Awareness of Personal Sin',
    grace: 'Lord, give me a growing awareness of my sin and its effects — not for shame, but for honesty.',
    background: 'Ignatius asks retreatants to look honestly at their own sin history — not to wallow in guilt but to come to an honest self-knowledge that opens us for deeper healing and grace.',
    days: [
      { day: 1, title: 'The Honest Interior', scripture: 'Psalm 51:1-12', reflection: '"My sin is always before me." Sit with one area of your life where you know you have repeatedly fallen short. Be specific and honest.' },
      { day: 2, title: 'Patterns and Wounds', scripture: 'Romans 7:14-25', reflection: 'Paul describes doing what he hates. What patterns of sin do you return to again and again? What might be underneath them?' },
      { day: 3, title: 'What I Have Left Undone', scripture: 'Matthew 25:41-45', reflection: 'Much of the Church\'s teaching on sin includes the sins of omission — what we failed to do. What have you neglected? Who have you passed by?' },
      { day: 4, title: 'The Plank in My Eye', scripture: 'Matthew 7:1-5', reflection: 'Where do you most readily judge others? Is there a shadow of that fault in yourself that you find harder to see?' },
      { day: 5, title: 'Bringing It to the Light', scripture: 'John 3:19-21', reflection: 'Jesus says those who do evil avoid the light. What part of yourself do you most resist bringing before God? What would it mean to bring it today?' },
    ],
  },
  {
    week: 6, phase: PHASES.FIRST_WEEK,
    title: 'God\'s Mercy and Forgiveness',
    grace: 'Lord, let me receive your mercy — not just know it, but feel it.',
    background: 'The centerpiece of the First Week is the experience of God\'s mercy. Ignatius structures it so that we face our sinfulness only after anchoring in God\'s love, and always with the promise of forgiveness already in view.',
    days: [
      { day: 1, title: 'Mercy Without Measure', scripture: 'Luke 15:11-32 (full chapter)', reflection: 'The father in this parable represents God. What do you most need to receive from this Father today — the welcome, the robe, the ring, the feast?' },
      { day: 2, title: 'Steadfast Love', scripture: 'Hosea 11:1-9', reflection: '"My heart is overwhelmed… I will not give vent to my blazing anger." God\'s mercy overcomes divine wrath. Where do you fear condemnation that God is actually offering compassion?' },
      { day: 3, title: 'The Cross as Mercy', scripture: 'Romans 5:6-11', reflection: 'Christ died for us while we were still sinners. Sit with the cross today as pure gift — not as something you earned but something given while you were still far off.' },
      { day: 4, title: 'Washed Clean', scripture: 'Isaiah 1:18', reflection: '"Though your sins are like scarlet, they shall be white as snow." What do you most need to have washed away? Bring it to God in prayer.' },
      { day: 5, title: 'No Condemnation', scripture: 'Romans 8:1-4', reflection: '"There is therefore now no condemnation." Do you believe this for yourself? What makes it hard to receive? Sit with that difficulty honestly.' },
    ],
  },
  {
    week: 7, phase: PHASES.FIRST_WEEK,
    title: 'Freedom and Healing',
    grace: 'Lord, begin to free me from whatever holds me back from loving you fully.',
    background: 'Having experienced mercy, Ignatius invites us toward the freedom that mercy makes possible. Ignatian "indifference" is not apathy but the freedom to choose what leads to God rather than being driven by fear, compulsion, or disordered desire.',
    days: [
      { day: 1, title: 'The Yoke That Is Light', scripture: 'Matthew 11:28-30', reflection: 'Jesus offers rest to the burdened. What is your heaviest burden right now? What would it mean to lay it down?' },
      { day: 2, title: 'Where Freedom Is', scripture: '2 Corinthians 3:17', reflection: '"Where the Spirit of the Lord is, there is freedom." What enslaves you? Name it honestly before God.' },
      { day: 3, title: 'Healing the Wounds', scripture: 'Isaiah 61:1-3', reflection: 'Jesus came to bind up the brokenhearted, set captives free, comfort all who mourn. What wound in you still needs healing? Bring it to Christ today.' },
      { day: 4, title: 'Disordered Attachments', scripture: 'Mark 10:17-22', reflection: 'The rich young man went away sad. What might God be asking you to loosen your grip on? What are you afraid to offer?' },
      { day: 5, title: 'The Freedom of Love', scripture: 'Galatians 5:1, 13-14', reflection: '"For freedom Christ has set us free." True freedom is not freedom from but freedom for — for love. What might you do with greater freedom that love requires of you?' },
    ],
  },
  {
    week: 8, phase: PHASES.FIRST_WEEK,
    title: 'Conversion of Heart',
    grace: 'Lord, turn my whole heart toward you.',
    background: 'The First Week closes with metanoia — a turning of the whole self toward God. This is not a one-time event but a pattern of life. We enter the Second Week with hearts that have been opened, cleansed, and re-oriented.',
    days: [
      { day: 1, title: 'A New Heart', scripture: 'Ezekiel 36:25-27', reflection: '"I will give you a new heart and put a new spirit within you." What in your heart needs to be made new? Ask for it specifically.' },
      { day: 2, title: 'The First Love', scripture: 'Revelation 2:2-5', reflection: 'The letter to Ephesus warns of leaving the first love. When were you most alive in your relationship with God? What happened since?' },
      { day: 3, title: 'Repentance and Return', scripture: 'Joel 2:12-13', reflection: '"Return to me with your whole heart." What would a full-hearted return to God look like in your daily life this week?' },
      { day: 4, title: 'The Narrow Gate', scripture: 'Matthew 7:13-14', reflection: 'The narrow gate is not a gate of performance but of undivided attention. What divides your attention and keeps the gate wide?' },
      { day: 5, title: 'Entering the Second Week', scripture: 'Matthew 4:17', reflection: '"Repent, for the kingdom of heaven is at hand." As you prepare to follow Jesus through the Second Week, what is your desire? What do you ask of God?' },
    ],
  },

  // ─── SECOND WEEK ─────────────────────────────────────────────────────────────
  {
    week: 9, phase: PHASES.SECOND_WEEK,
    title: 'The Kingdom of Christ',
    grace: 'Lord, let me hear your call and respond generously.',
    background: 'The Second Week opens with the meditation on the Kingdom — a great king inviting companions to join his mission. Ignatius wants this to stir desire in us: not just to be saved but to be part of something larger than ourselves.',
    days: [
      { day: 1, title: 'A King Worth Following', scripture: 'Mark 1:14-20', reflection: 'Jesus calls and they follow immediately. What is it about Jesus that you find compelling — that makes you want to follow?' },
      { day: 2, title: 'The Kingdom Announced', scripture: 'Luke 4:16-21', reflection: 'Jesus declares the nature of his kingdom: good news to the poor, liberty to captives. What part of this vision moves you most? Troubles you?' },
      { day: 3, title: 'The Cost of the Call', scripture: 'Luke 9:57-62', reflection: 'Three would-be followers are each stopped by something. What tends to stop your following? What is your "let me first..."?' },
      { day: 4, title: 'Sent Out', scripture: 'Luke 10:1-12', reflection: 'Jesus sends laborers into the harvest. You are not only a recipient of the Kingdom but an agent of it. How do you feel about that call?' },
      { day: 5, title: 'Wanting to Want', scripture: 'Psalm 40:6-8', reflection: 'Ignatius prays for "generous souls who are willing to offer themselves entirely." Where is your generosity? Where is your hesitation? Bring both honestly.' },
    ],
  },
  {
    week: 10, phase: PHASES.SECOND_WEEK,
    title: 'The Incarnation',
    grace: 'Lord, let me know you more intimately, love you more ardently, follow you more closely.',
    background: 'Ignatius asks retreatants to contemplate the Trinity looking upon the world and deciding to send the Son. God does not observe from a distance — God enters. The Incarnation is the foundation of all that follows.',
    days: [
      { day: 1, title: 'God Sees the World', scripture: 'John 3:16-17', reflection: 'God so loved the world. Imagine looking at the world the way God does — with love for every person. What do you see?' },
      { day: 2, title: 'The Word Becomes Flesh', scripture: 'John 1:1-14', reflection: '"The Word became flesh and dwelt among us." What does it mean to you that God chose embodiment — birth, hunger, weariness, friendship?' },
      { day: 3, title: 'The Annunciation', scripture: 'Luke 1:26-38', reflection: 'The angel says "Do not be afraid." God\'s invitation often meets our fear. What are you afraid of in following more closely?' },
      { day: 4, title: 'The Visitation', scripture: 'Luke 1:39-56', reflection: 'Mary brings Jesus to Elizabeth and the baby leaps. How do you carry Christ to others? Where is there joy in that?' },
      { day: 5, title: 'God Emptied', scripture: 'Philippians 2:5-8', reflection: 'Christ "did not deem equality with God something to cling to." Where are you clinging to status, control, or comfort in ways that keep you from serving?' },
    ],
  },
  {
    week: 11, phase: PHASES.SECOND_WEEK,
    title: 'The Nativity',
    grace: 'Lord, let me be born anew with you — small, vulnerable, and dependent on your love.',
    background: 'Ignatius uses the method of "imaginative contemplation" especially here: place yourself in the scene. See, hear, smell, taste. Let the mystery touch you, not just inform you.',
    days: [
      { day: 1, title: 'No Room', scripture: 'Luke 2:1-7', reflection: 'There was no room for Jesus in the inn. Where in your life is there "no room" for him? What is crowding him out?' },
      { day: 2, title: 'The Shepherds\' Night', scripture: 'Luke 2:8-20', reflection: 'The good news comes first to shepherds — low status, working at night. What does it tell you about God that the first announcement goes to them?' },
      { day: 3, title: 'The Magi\'s Journey', scripture: 'Matthew 2:1-12', reflection: 'The Magi travel far and follow a star they cannot fully explain. What is the "star" drawing you in this retreat? What are you searching for?' },
      { day: 4, title: 'The Presentation', scripture: 'Luke 2:22-38', reflection: 'Simeon and Anna recognize Jesus after years of faithful waiting. What are you waiting for? What does faithful, patient hope look like for you?' },
      { day: 5, title: 'The Flight and the Return', scripture: 'Matthew 2:13-15', reflection: 'The holy family becomes refugees. How does this shape your understanding of who Jesus is and whom he is with?' },
    ],
  },
  {
    week: 12, phase: PHASES.SECOND_WEEK,
    title: 'The Hidden Years and Baptism',
    grace: 'Lord, show me how to be faithful in the small and hidden things.',
    background: 'Jesus spent 30 years in obscurity before 3 years of public ministry. Ignatius values the hidden life — the ordinary, unremarkable faithfulness that forms the person God uses.',
    days: [
      { day: 1, title: 'The Hidden Years', scripture: 'Luke 2:39-40', reflection: '"The child grew and became strong, filled with wisdom." What is growing and forming in you during the hidden seasons of your life?' },
      { day: 2, title: 'Lost and Found', scripture: 'Luke 2:41-52', reflection: '"Did you not know I must be in my Father\'s house?" When have you felt lost and then found — or sensed a deeper calling beginning to emerge?' },
      { day: 3, title: 'The Baptism', scripture: 'Matthew 3:13-17', reflection: '"You are my beloved Son; with you I am well pleased." Imagine hearing these words spoken over you by God. What does it feel like?' },
      { day: 4, title: 'The Desert Temptation', scripture: 'Matthew 4:1-11', reflection: 'Jesus is tested on bread, power, and prestige. Which of these temptations do you most identify with? What is the desert showing you right now?' },
      { day: 5, title: 'Before the Ministry Begins', scripture: 'Isaiah 42:1-4', reflection: 'The servant brings justice gently, without breaking the bruised reed. How are you being formed for gentleness and perseverance before God uses you?' },
    ],
  },
  {
    week: 13, phase: PHASES.SECOND_WEEK,
    title: 'The Call of the Disciples',
    grace: 'Lord, help me to know what it truly means to follow you.',
    background: 'Jesus does not call perfect people. He calls ordinary people and walks with them through misunderstanding, failure, and gradual growth. The disciples are not examples of instant transformation but of lifelong following.',
    days: [
      { day: 1, title: 'Come and See', scripture: 'John 1:35-42', reflection: 'Jesus asks "What are you looking for?" What are you looking for from this retreat? From your life of faith?' },
      { day: 2, title: 'Leaving the Nets', scripture: 'Mark 1:16-20', reflection: 'They left their nets "immediately." What would it look like to follow with that kind of promptness in your own life?' },
      { day: 3, title: 'Matthew at the Tax Booth', scripture: 'Matthew 9:9-13', reflection: 'Jesus calls a collaborator and eats with sinners. How does Jesus\'s willingness to call and eat with the disreputable challenge your own assumptions about who belongs?' },
      { day: 4, title: 'The Twelve Sent Out', scripture: 'Luke 9:1-6', reflection: 'They are given authority and sent with almost nothing — no staff, no bag, no extra tunic. Where is God asking you to go with less than you think you need?' },
      { day: 5, title: 'Who Is My Neighbor?', scripture: 'Luke 10:25-37', reflection: 'The Samaritan stops. The religious leaders pass by. What keeps you walking past people who need help? What would it cost you to stop?' },
    ],
  },
  {
    week: 14, phase: PHASES.SECOND_WEEK,
    title: 'The Beatitudes',
    grace: 'Lord, transform my values into yours — let me learn to see as you see.',
    background: 'The Beatitudes describe a way of seeing and being that is the opposite of the world\'s logic. Each beatitude is a grace — not an achievement but a gift that comes from closeness to God.',
    days: [
      { day: 1, title: 'Poor in Spirit', scripture: 'Matthew 5:3; Luke 6:20', reflection: 'Blessed are the poor in spirit — those who know they have nothing to offer but their need. How comfortable are you with your own poverty before God?' },
      { day: 2, title: 'Mourning and Mercy', scripture: 'Matthew 5:4-7', reflection: 'Mourning, meekness, and mercy are blessings. Where do you need to allow yourself to mourn? Where do you need to extend mercy?' },
      { day: 3, title: 'Pure Heart and Peacemaker', scripture: 'Matthew 5:8-9', reflection: 'A pure heart is an undivided heart. Where is your heart divided? What would it mean to be a peacemaker in your specific relationships and context?' },
      { day: 4, title: 'Persecuted for Righteousness', scripture: 'Matthew 5:10-12', reflection: 'Have you ever suffered for doing what is right? What might you be avoiding that faithfulness would require?' },
      { day: 5, title: 'Salt and Light', scripture: 'Matthew 5:13-16', reflection: 'Salt that loses its saltiness is useless. What in you is still distinctive, flavorful, life-giving? What has grown bland? How is your light shining?' },
    ],
  },
  {
    week: 15, phase: PHASES.SECOND_WEEK,
    title: 'Two Standards',
    grace: 'Lord, let me see clearly the difference between your ways and the world\'s ways, and choose yours.',
    background: 'One of the most distinctly Ignatian meditations: two leaders — one promising riches, honor, and pride; the other offering poverty, humility, and all virtues. Ignatius wants us to see which "standard" we actually follow.',
    days: [
      { day: 1, title: 'The Enemy\'s Trap', scripture: 'Luke 4:5-8', reflection: 'Satan offers Jesus the kingdoms of the world. What "kingdoms" are you tempted to pursue — recognition, security, success? What does each one cost?' },
      { day: 2, title: 'The Way of Riches and Pride', scripture: 'James 4:1-6', reflection: 'The world offers: first riches → then honor → then pride. Where do you see this progression in your own desires or behavior?' },
      { day: 3, title: 'The Way of Poverty and Humility', scripture: 'Philippians 3:7-11', reflection: 'Paul counts his credentials as rubbish compared to knowing Christ. What would you have to "count as loss" to follow the way of humility more fully?' },
      { day: 4, title: 'Three Kinds of Humility', scripture: 'Matthew 5:3-10; Luke 14:11', reflection: 'Ignatius describes three levels: avoiding serious sin, indifference between riches and poverty, actually preferring poverty and humility as Jesus did. Where do you live?' },
      { day: 5, title: 'Choosing Your Standard', scripture: 'Joshua 24:14-15', reflection: '"Choose this day whom you will serve." This is not a one-time choice but a daily one. What standard do you actually choose today — in your work, spending, relationships?' },
    ],
  },
  {
    week: 16, phase: PHASES.SECOND_WEEK,
    title: 'Miracles and the Healing Ministry',
    grace: 'Lord, let me believe that you can heal me — and that you want to.',
    background: 'Jesus\'s miracles are signs of the Kingdom — not magic tricks but demonstrations that God\'s reign means restoration. Each healing is also an invitation to bring our own broken places before him.',
    days: [
      { day: 1, title: 'The Leper Who Asks', scripture: 'Mark 1:40-45', reflection: 'The leper says "If you will, you can make me clean." Notice the "if" — the honest uncertainty. What do you bring to Jesus with that same raw honesty?' },
      { day: 2, title: 'The Friends Who Carry', scripture: 'Mark 2:1-12', reflection: 'The paralyzed man was brought by friends. Who carries you when you cannot come on your own? Who might you need to carry right now?' },
      { day: 3, title: 'She Touched the Hem', scripture: 'Mark 5:25-34', reflection: 'She had suffered for 12 years. She reached out in secret. Jesus stopped and found her. What have you suffered long in silence? Bring it to Jesus today.' },
      { day: 4, title: 'The Man Born Blind', scripture: 'John 9:1-12, 35-39', reflection: '"Lord, I believe." The man born blind worships Jesus when he understands who healed him. What would it mean for you to see more clearly — spiritually?' },
      { day: 5, title: 'Come Out', scripture: 'John 11:38-44', reflection: '"Lazarus, come out." What in you has died — or feels buried and sealed? Hear Jesus calling you by name to come out.' },
    ],
  },
  {
    week: 17, phase: PHASES.SECOND_WEEK,
    title: 'Parables of the Kingdom',
    grace: 'Lord, give me ears to hear and a heart that understands.',
    background: 'Jesus teaches primarily through story and image. The parables resist simple moralizing — they are meant to disrupt our assumptions and open us to the surprising logic of the Kingdom.',
    days: [
      { day: 1, title: 'The Sower', scripture: 'Matthew 13:1-9, 18-23', reflection: 'What kind of soil are you right now — rocky, thorny, hard, or receptive? What would it take to become more receptive ground?' },
      { day: 2, title: 'The Mustard Seed and Yeast', scripture: 'Matthew 13:31-33', reflection: 'The Kingdom starts tiny and hidden. Where in your life or community is God working in small, unseen ways that you might be overlooking?' },
      { day: 3, title: 'The Hidden Treasure and Pearl', scripture: 'Matthew 13:44-46', reflection: 'Both parables are about finding something of supreme value and giving everything for it. Have you found that treasure? What would you give for it?' },
      { day: 4, title: 'The Prodigal and the Elder', scripture: 'Luke 15:25-32', reflection: 'The elder son stayed home but was far from the father\'s heart. Is there resentment in you toward "prodigals" who seem to receive grace easily? Bring that to God honestly.' },
      { day: 5, title: 'Workers in the Vineyard', scripture: 'Matthew 20:1-16', reflection: 'The last are paid the same as the first. Does this bother you? What does your reaction reveal about how you think God\'s grace should work?' },
    ],
  },
  {
    week: 18, phase: PHASES.SECOND_WEEK,
    title: 'The Transfiguration',
    grace: 'Lord, let me glimpse who you truly are, so that I can follow you into the darkness ahead.',
    background: 'The Transfiguration stands as the pivot of the Second Week — a moment of glory before the descent to Jerusalem. Peter wants to stay. But Jesus leads them down. In the retreat, this is the moment before the Passion begins.',
    days: [
      { day: 1, title: 'The Mountain of Prayer', scripture: 'Luke 9:28-36', reflection: 'Jesus takes three disciples up to pray and is transfigured. Have there been "mountain" moments in your prayer life — glimpses of something greater? Rest in the memory of one.' },
      { day: 2, title: 'Moses and Elijah', scripture: 'Matthew 17:1-8', reflection: 'The Law and the Prophets appear with Jesus. He fulfills and surpasses both. What in your spiritual history has led you to this moment with Jesus?' },
      { day: 3, title: 'Listen to Him', scripture: 'Mark 9:2-8', reflection: '"This is my beloved Son. Listen to him." What is Jesus asking you to hear and accept that you have been reluctant to listen to?' },
      { day: 4, title: 'Wanting to Stay', scripture: 'Luke 9:33', reflection: 'Peter wants to build tents and stay on the mountain. Where are you tempted to stay in spiritual comfort rather than follow Jesus into harder places?' },
      { day: 5, title: 'Coming Down', scripture: 'Luke 9:37-43', reflection: 'They come down from the mountain into the crowd\'s need. The glory was real, but so is the work below. How does your mountaintop experience equip you for what\'s below?' },
    ],
  },
  {
    week: 19, phase: PHASES.SECOND_WEEK,
    title: 'The Journey to Jerusalem',
    grace: 'Lord, give me courage to follow you even when the path leads to difficulty.',
    background: 'Luke\'s Gospel has a long "travel narrative" — Jesus steadfastly sets his face toward Jerusalem knowing what awaits him there. He teaches, heals, and deepens disciples as he walks toward the cross.',
    days: [
      { day: 1, title: 'He Set His Face', scripture: 'Luke 9:51-53', reflection: '"He set his face to go to Jerusalem." What does it mean to set your face toward what God is calling you to — even when you know it will cost you?' },
      { day: 2, title: 'Teaching on the Way', scripture: 'Luke 10:38-42', reflection: 'Mary sits at his feet; Martha is distracted. In the midst of your busyness, what is the "one thing necessary" that you are neglecting?' },
      { day: 3, title: 'The Rich Man Who Went Away Sad', scripture: 'Luke 18:18-25', reflection: 'The man had followed the commandments since youth, but the one thing was too much. What is the one thing that remains between you and full surrender?' },
      { day: 4, title: 'Zacchaeus in the Tree', scripture: 'Luke 19:1-10', reflection: 'Zacchaeus was short and climbed a tree to see — an undignified act. What undignified thing would you need to do to get closer to Jesus?' },
      { day: 5, title: 'Approaching the City', scripture: 'Luke 19:41-44', reflection: 'Jesus wept over Jerusalem. What do you grieve over — in the world, in your community, in yourself? Let your grief become prayer.' },
    ],
  },
  {
    week: 20, phase: PHASES.SECOND_WEEK,
    title: 'The Last Supper',
    grace: 'Lord, let me receive the full depth of what you offer me — your very self.',
    background: 'The Second Week closes at the table. Ignatius wants retreatants to be present in that upper room — to see, to receive, and to hear the last teachings of Jesus before the Passion begins.',
    days: [
      { day: 1, title: 'Preparing the Room', scripture: 'Luke 22:7-13', reflection: 'Disciples are sent to prepare a room. What preparation is needed in your own heart to receive Jesus more fully this week?' },
      { day: 2, title: 'The Washing of Feet', scripture: 'John 13:1-15', reflection: '"Do you understand what I have done to you?" Do you? Sit with Jesus kneeling before you, washing your feet. What do you feel? What does he say?' },
      { day: 3, title: 'This Is My Body', scripture: 'Luke 22:14-20', reflection: '"This is my body, given for you." Jesus gives himself completely. How fully are you receiving this gift — in Eucharist, in prayer, in daily life?' },
      { day: 4, title: 'The New Commandment', scripture: 'John 13:34-35', reflection: '"Love one another as I have loved you." This is the measure — not as you feel like loving, but as he loved. Where is this commandment most challenging for you right now?' },
      { day: 5, title: 'The Farewell Discourse', scripture: 'John 14:1-14', reflection: '"Do not let your hearts be troubled." Jesus speaks these words knowing what is coming. What trouble is in your heart? Bring it to him at this table.' },
    ],
  },

  // ─── THIRD WEEK ──────────────────────────────────────────────────────────────
  {
    week: 21, phase: PHASES.THIRD_WEEK,
    title: 'Gethsemane',
    grace: 'Lord, let me be with you in your anguish — and receive your courage.',
    background: 'The Third Week enters the Passion. The grace is to feel sorrow with Christ in his sorrow, and to suffer with him in his suffering. Ignatius does not want us to analyze the Passion from a distance but to be present to it.',
    days: [
      { day: 1, title: 'The Garden', scripture: 'Matthew 26:36-46', reflection: 'Jesus asks the disciples to stay awake with him. They fall asleep three times. When have you fallen asleep spiritually when Jesus needed your presence?' },
      { day: 2, title: 'Not My Will', scripture: 'Luke 22:39-46', reflection: '"Not my will but yours be done." This is the most costly prayer we can pray. Where are you resisting God\'s will right now? Can you pray this honestly?' },
      { day: 3, title: 'An Angel Strengthens Him', scripture: 'Luke 22:43-44', reflection: 'Jesus sweats blood and an angel comes. God does not remove the cup but strengthens Jesus to drink it. Where do you need God\'s strength — not to escape but to endure?' },
      { day: 4, title: 'The Betrayal', scripture: 'Matthew 26:47-50', reflection: '"Friend, do what you are here to do." Jesus calls Judas friend even as he is betrayed. Have you ever been betrayed by a friend? Have you ever been the one who betrayed?' },
      { day: 5, title: 'All Fled', scripture: 'Mark 14:50', reflection: '"And they all left him and fled." The disciples abandoned Jesus in his hour of need. When have you fled from difficulty or denied your connection to Christ?' },
    ],
  },
  {
    week: 22, phase: PHASES.THIRD_WEEK,
    title: 'Arrest and Trial',
    grace: 'Lord, let me stand with you before those who condemn you — and know I am loved in my own condemnation.',
    background: 'Jesus is led through a series of trials — before Annas, Caiaphas, Pilate, and Herod. At each, false witnesses speak, leaders choose expediency over truth, and the crowd turns. Jesus remains silent or speaks the truth.',
    days: [
      { day: 1, title: 'Peter\'s Denial', scripture: 'Luke 22:54-62', reflection: 'Peter denies Jesus three times and then the Lord looks at him and Peter weeps. When have you denied Christ — in your words, actions, or silence? Let that grief open you to his gaze.' },
      { day: 2, title: 'Before the Council', scripture: 'Mark 14:60-65', reflection: '"Are you the Christ?" "I am." Jesus speaks truth and is struck. Where do you find yourself silent when truth needs speaking — about your faith, about justice, about what is right?' },
      { day: 3, title: 'Pilate\'s Question', scripture: 'John 18:33-38', reflection: '"What is truth?" Pilate cannot recognize truth standing before him. What truths are you having trouble recognizing or accepting in your own life?' },
      { day: 4, title: 'Barabbas Released', scripture: 'Matthew 27:15-26', reflection: 'A murderer goes free; the innocent is condemned. We are Barabbas. Sit with that. What does it mean to live as someone for whom another took the penalty?' },
      { day: 5, title: 'The Scourging and Mockery', scripture: 'Mark 15:16-20', reflection: 'Soldiers put a purple robe on Jesus and mock him as king. The one who is truly King accepts humiliation. What does his humility ask of your pride?' },
    ],
  },
  {
    week: 23, phase: PHASES.THIRD_WEEK,
    title: 'The Way of the Cross',
    grace: 'Lord, let me walk with you — not to understand suffering but to be present to yours and to those who suffer with you today.',
    background: 'The Via Dolorosa — Jesus carries the cross, falls, meets his mother, encounters Simon, Veronica, and the weeping women. Each encounter is an invitation to see where we meet Christ in his passion today.',
    days: [
      { day: 1, title: 'Taking Up the Cross', scripture: 'Matthew 27:31-32; Mark 8:34', reflection: '"Take up your cross and follow me." What cross has been laid on you that you did not choose? How is Jesus walking with you in it?' },
      { day: 2, title: 'Simon of Cyrene', scripture: 'Mark 15:21', reflection: 'Simon was compelled to carry the cross — he had not volunteered. Have you been asked to bear a burden you did not choose? What happened?' },
      { day: 3, title: 'The Weeping Women', scripture: 'Luke 23:27-31', reflection: 'Jesus says "Weep not for me but for yourselves." What brokenness in your community, nation, or world does Jesus invite your tears over — not just sympathy for him?' },
      { day: 4, title: 'The Two Criminals', scripture: 'Luke 23:39-43', reflection: 'One criminal mocks, one trusts. "Remember me." That is enough. What would it mean to bring only your need to Jesus today — nothing more?' },
      { day: 5, title: 'His Mother and the Beloved Disciple', scripture: 'John 19:25-27', reflection: '"Behold your mother." Even dying, Jesus tends to relationships. What relationships do you need to tend to? Who has been given to you? Who are you given to?' },
    ],
  },
  {
    week: 24, phase: PHASES.THIRD_WEEK,
    title: 'The Crucifixion',
    grace: 'Lord, let me stay beneath the cross — not with answers but with love.',
    background: 'Ignatius asks us simply to be present at the cross — to look upon the one who was pierced. There are no easy explanations here. Only love. Only the complete self-gift of God.',
    days: [
      { day: 1, title: 'Father Forgive Them', scripture: 'Luke 23:34', reflection: '"They do not know what they are doing." Jesus prays forgiveness for his killers. Who in your life is difficult to forgive? Bring them here, beneath this cross.' },
      { day: 2, title: 'My God, My God', scripture: 'Mark 15:34; Psalm 22:1-2, 24-32', reflection: 'Jesus cries out in desolation. He quotes Psalm 22, which ends in trust. Have you ever felt abandoned by God? How did you hold on — or did you?' },
      { day: 3, title: 'It Is Finished', scripture: 'John 19:28-30', reflection: '"It is finished" — tetelestai, completed. What in your life needs to be brought to completion rather than endlessly prolonged? What can you release?' },
      { day: 4, title: 'The Pierced Side', scripture: 'John 19:31-37; Zechariah 12:10', reflection: '"They shall look upon the one they have pierced." Simply look. Rest beneath the cross in silence today. Let love meet you here.' },
      { day: 5, title: 'Taken Down', scripture: 'Luke 23:50-56', reflection: 'Joseph and Nicodemus — secret disciples — come forward at the most dangerous moment. What are you keeping secret about your faith? What would it mean to come forward?' },
    ],
  },
  {
    week: 25, phase: PHASES.THIRD_WEEK,
    title: 'Holy Saturday — Waiting',
    grace: 'Lord, teach me to wait in darkness without losing hope.',
    background: 'Holy Saturday is often overlooked but may be the most relevant day for ordinary Christian life. We live most of our lives in Holy Saturday — between the death and the resurrection, between promise and fulfillment.',
    days: [
      { day: 1, title: 'The Sealed Tomb', scripture: 'Matthew 27:62-66', reflection: 'The authorities seal the tomb to prevent resurrection. Where in your life are things sealed tight, seemingly beyond hope? Name it before God.' },
      { day: 2, title: 'The Disciples in Hiding', scripture: 'John 20:19', reflection: 'They hid behind locked doors for fear. Where have you locked yourself in — behind fear, cynicism, self-protection? What would need to happen for the doors to open?' },
      { day: 3, title: 'The Women\'s Grief', scripture: 'Luke 23:55-56', reflection: 'The women prepared spices and then rested on the Sabbath, observing the law even in grief. Where do you find yourself honoring God\'s rhythms even in the middle of loss?' },
      { day: 4, title: 'Descent to the Dead', scripture: '1 Peter 3:18-19; Ephesians 4:9', reflection: 'The Church has always believed Christ descended to the dead — that no place, not even death, is outside his reach. Who or what do you need to entrust to this reaching love?' },
      { day: 5, title: 'Waiting', scripture: 'Psalm 130', reflection: '"I wait for the Lord; my soul waits, and in his word I hope." What are you waiting for? Practice the prayer of waiting — not demanding, not despairing, but hoping.' },
    ],
  },

  // ─── FOURTH WEEK ─────────────────────────────────────────────────────────────
  {
    week: 26, phase: PHASES.FOURTH_WEEK,
    title: 'The Resurrection — The Empty Tomb',
    grace: 'Lord, let the joy of the Resurrection become real to me — not just as doctrine but as lived experience.',
    background: 'The Fourth Week is the week of joy. Ignatius instructs retreatants to ask for the grace of rejoicing with Christ. The resurrection is not just an event in the past but a present reality that changes everything.',
    days: [
      { day: 1, title: 'The Empty Tomb', scripture: 'John 20:1-10', reflection: '"He saw and believed." What is it that made belief possible at the empty tomb? What does it take for your own belief to come alive?' },
      { day: 2, title: 'Mary in the Garden', scripture: 'John 20:11-18', reflection: 'Mary mistakes Jesus for the gardener until he speaks her name. He calls you by name. Sit in silence and let him say your name. What do you hear?' },
      { day: 3, title: 'The Road to Emmaus', scripture: 'Luke 24:13-35', reflection: 'Two disciples walk away in grief — and Jesus walks with them without being recognized. When has God been present to you in a way you only recognized looking back?' },
      { day: 4, title: 'Peace Be With You', scripture: 'John 20:19-23', reflection: '"Peace be with you." Jesus offers peace to the disciples who had abandoned him. He breathes the Spirit on them. What would it mean to receive his peace right now?' },
      { day: 5, title: 'My Lord and My God', scripture: 'John 20:24-29', reflection: 'Thomas wants to touch the wounds. Jesus offers them. Your doubt is welcome here. Bring your wounds and your doubts to the risen Christ.' },
    ],
  },
  {
    week: 27, phase: PHASES.FOURTH_WEEK,
    title: 'Resurrection Appearances',
    grace: 'Lord, help me to recognize you in the ordinary and the unexpected.',
    background: 'The resurrection appearances are consistently surprising — Jesus is recognized through actions: the breaking of bread, the calling of a name, the miraculous catch. The risen Christ meets people in their daily life and work.',
    days: [
      { day: 1, title: 'Breakfast on the Shore', scripture: 'John 21:1-14', reflection: 'The disciples had been fishing all night — nothing. Then Jesus, from the shore, tells them where to cast. Where are you toiling without fruit? What might Jesus say from your shore?' },
      { day: 2, title: 'Do You Love Me?', scripture: 'John 21:15-19', reflection: 'Jesus asks Peter three times — once for each denial. Where do you need to be re-commissioned after failure? Let Jesus ask you the question now.' },
      { day: 3, title: 'Appearing to Five Hundred', scripture: '1 Corinthians 15:3-8', reflection: 'Paul lists the resurrection witnesses like evidence in a court case. What is your own witness to the risen Christ? What have you personally seen and experienced?' },
      { day: 4, title: 'Doubting and Worshiping', scripture: 'Matthew 28:16-17', reflection: '"When they saw him, they worshiped him — but some doubted." Doubt and worship coexist in the same moment. How is that true in your own faith?' },
      { day: 5, title: 'The Great Commission', scripture: 'Matthew 28:18-20', reflection: '"Go and make disciples." This is not a command to experts but to those who doubted and worshiped. What does this sending mean for your specific life and context?' },
    ],
  },
  {
    week: 28, phase: PHASES.FOURTH_WEEK,
    title: 'Ascension and Pentecost',
    grace: 'Lord, fill me with your Spirit — for the mission you are giving me.',
    background: 'The Ascension is not abandonment but empowerment. Jesus returns to the Father so that the Spirit can come to all. Pentecost is the birth of the Church and the beginning of the mission of all disciples.',
    days: [
      { day: 1, title: 'He Was Lifted Up', scripture: 'Acts 1:6-11', reflection: '"Why do you stand looking up into heaven?" The disciples want to stay watching. What are you watching for that is keeping you from the mission?' },
      { day: 2, title: 'Waiting Together', scripture: 'Acts 1:12-14', reflection: 'They returned and devoted themselves to prayer — together. What community of prayer do you have? What would it mean to wait on the Spirit together?' },
      { day: 3, title: 'Wind and Fire', scripture: 'Acts 2:1-4', reflection: 'The Spirit comes like wind and fire — uncontrolled, purifying, energizing. Where do you sense the Spirit moving in your life right now? Where are you resisting?' },
      { day: 4, title: 'Poured Out on All Flesh', scripture: 'Acts 2:14-21; Joel 2:28-29', reflection: 'Young and old, men and women, servants — the Spirit is poured out without distinction. How does the universality of Pentecost challenge your sense of who belongs?' },
      { day: 5, title: 'The First Community', scripture: 'Acts 2:42-47', reflection: 'The early church: teaching, fellowship, breaking bread, prayer. Giving to all in need. Praising God and having favor with people. Which of these is most alive in your community? Which is most lacking?' },
    ],
  },
  {
    week: 29, phase: PHASES.FOURTH_WEEK,
    title: 'Contemplation to Attain Love',
    grace: 'Lord, take and receive all that I am. Let your love work in me and through me.',
    background: 'The famous Contemplatio ad Amorem closes the Exercises. Ignatius has three points: recall all the gifts God has given; see God laboring in all things for your sake; recognize everything as gift flowing from the infinite love of God.',
    days: [
      { day: 1, title: 'Love Is Shown in Deeds', scripture: '1 John 4:9-12', reflection: 'Ignatius writes that love consists in sharing — the lover giving what they have to the beloved. Make a long, unhurried list of everything God has given you. Let it become gratitude.' },
      { day: 2, title: 'God Labors for Me', scripture: 'John 5:17', reflection: '"My Father is at work until now, and I am at work." Ignatius contemplates God laboring in creation, in history, in your own life. Where do you see God at work for you right now?' },
      { day: 3, title: 'God Dwelling in Things', scripture: 'Acts 17:28', reflection: '"In him we live and move and have our being." Ignatius sees God present in every creature, giving it being, life, sensation, understanding. Practice seeing God in three ordinary things today.' },
      { day: 4, title: 'The Suscipe', scripture: 'Psalm 16:5-11', reflection: '"Take, Lord, and receive all my liberty, my memory, my understanding, and all my will." Pray the Suscipe slowly. What is the hardest thing to offer? Offer it.' },
      { day: 5, title: 'Seeing God in All Things', scripture: 'Romans 8:38-39', reflection: 'Nothing in all creation can separate you from the love of God. As the retreat draws to its close, how has your capacity to see God in all things grown? What has changed?' },
    ],
  },
  {
    week: 30, phase: PHASES.FOURTH_WEEK,
    title: 'Sending Forth',
    grace: 'Lord, let the grace of this retreat become the way I live — now and always.',
    background: 'The retreat ends not in a church but in the world. Ignatius shaped disciples who could "find God in all things" — in their work, relationships, struggles, and joys. The goal is not a spiritual high but a habitual orientation of the whole life toward God.',
    days: [
      { day: 1, title: 'What Has Changed?', scripture: 'Philippians 1:6', reflection: 'God who began a good work in you will bring it to completion. Look back over the thirty weeks. What has shifted? What do you know now that you did not know before?' },
      { day: 2, title: 'Taking It into Daily Life', scripture: 'Colossians 3:12-17', reflection: 'Whatever you do, do it all in the name of the Lord Jesus. How will the graces of this retreat be woven into your daily work, relationships, and choices?' },
      { day: 3, title: 'The Ongoing Examen', scripture: 'Psalm 139:23-24', reflection: '"Search me and know my heart." The Examen is the one practice Ignatius insisted on. Commit to a daily prayer of review. When and how will you do it?' },
      { day: 4, title: 'Continuing Companions', scripture: 'Hebrews 10:24-25', reflection: 'The retreat was never meant to be done alone. Who has walked with you? Who will continue to walk with you? How will you stay connected to a community of disciples?' },
      { day: 5, title: 'God Goes With You', scripture: 'Deuteronomy 31:8; Matthew 28:20', reflection: '"I am with you always, to the end of the age." You are sent — not alone but accompanied. Go in peace. The retreat is over; the journey continues. What is your next step?' },
    ],
  },
];

export default schedule
