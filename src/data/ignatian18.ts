// 18th Annotation — Adapted Spiritual Exercises (10 weeks)
// Based on the Spiritual Exercises of St. Ignatius of Loyola (1548, public domain)
// Adapted for everyday life; 5 prayer days per week, days 6-7 are rest and review.
// Traditional structure: Foundation · First Week · Second Week · Third Week · Fourth Week

const PHASES = {
  FOUNDATION:   'Foundation',
  FIRST_WEEK:   'First Week',
  SECOND_WEEK:  'Second Week',
  THIRD_WEEK:   'Third Week',
  FOURTH_WEEK:  'Fourth Week',
};

const schedule = [
  // ─── FOUNDATION ──────────────────────────────────────────────────────────────
  {
    week: 1, phase: PHASES.FOUNDATION,
    title: 'Created for Love',
    grace: 'To know, deeply and personally, that I am loved by God — and that this love is the foundation of everything.',
    background: 'Ignatius begins the Spiritual Exercises with a foundational truth: we were created to praise, love, and serve God, and through this to reach the fullness of life. Every other desire finds its proper place in relation to this end. This week we simply rest in the truth that we are created and loved.',
    days: [
      {
        day: 1, title: 'God Who Creates',
        scripture: 'Genesis 1:26–31',
        reflection: 'God looked at all that was made and called it "very good." You are included in that declaration. Sit with the image of God forming you, knowing you, and calling you good before you had done anything to earn it. What stirs in you as you receive that gaze?',
      },
      {
        day: 2, title: 'God Who Knows Me',
        scripture: 'Psalm 139:1–18',
        reflection: '"You have searched me, Lord, and you know me." Before a word is on your lips, God knows it. Before you rise, God is present. There is nowhere you can go that God is not already there. Pray slowly through this psalm, pausing wherever a phrase catches your heart.',
      },
      {
        day: 3, title: 'God Is Love',
        scripture: '1 John 4:7–16',
        reflection: '"God is love, and whoever remains in love remains in God, and God in them." This is not merely a description of God\'s behavior — it is God\'s nature. We love because we were first loved. Sit with the simplicity of that sequence: loved first, then able to love.',
      },
      {
        day: 4, title: 'Called Friends',
        scripture: 'John 15:9–17',
        reflection: '"I no longer call you servants… I have called you friends." Jesus speaks this at the Last Supper, on the eve of the cross. Friendship with God is not earned by performance but received as a gift. What does it mean to you, today, to be called a friend of God?',
      },
      {
        day: 5, title: 'Freedom of Heart',
        scripture: 'Matthew 6:19–21, 24–25',
        reflection: 'Ignatius called the disposition for the Exercises "indifference" — not apathy, but interior freedom: the ability to choose what leads to God rather than what feels comfortable. What in your life most competes for your heart? Bring it honestly before God, without trying to fix it yet.',
      },
    ],
  },
  {
    week: 2, phase: PHASES.FOUNDATION,
    title: 'Gratitude — Seeing God\'s Gifts',
    grace: 'To grow in gratitude, seeing God\'s presence and gifts woven through the ordinary moments of my life.',
    background: 'The Ignatian Examen is a daily prayer of awareness — looking back over the day to find where God was present. Gratitude is its starting point. This week we practice seeing: noticing gifts we overlook, consolations we take for granted, and the quiet presence of God in daily life.',
    days: [
      {
        day: 1, title: 'The Return of the One',
        scripture: 'Luke 17:11–19',
        reflection: 'Ten were healed; only one returned to give thanks. Jesus asks, "Where are the other nine?" This is not an accusation but an invitation. What graces have you received lately that you have not yet paused to acknowledge? Name them, slowly, as if returning to give thanks.',
      },
      {
        day: 2, title: 'All Is Gift',
        scripture: 'Psalm 8',
        reflection: '"What is mankind that you are mindful of them?" The psalmist is overwhelmed — not crushed — by the smallness of human life against the immensity of creation, and yet God cares. Today, notice three gifts you usually overlook: breath, light, a person who loves you.',
      },
      {
        day: 3, title: 'God in the Ordinary',
        scripture: 'Matthew 6:25–34',
        reflection: '"Look at the birds of the air… consider the lilies." Jesus points to the unremarkable as evidence of God\'s care. Where has God been present in your ordinary day — in a meal, a conversation, a moment of quiet? Practice noticing what you usually hurry past.',
      },
      {
        day: 4, title: 'Consolation and Desolation',
        scripture: 'Romans 8:26–28',
        reflection: 'Ignatius noticed that our interior movements — peace, joy, dryness, restlessness — are not random. They are data about where God is drawing us. Today, review the last few days: when did you feel alive, open, generous? When did you feel closed, flat, or anxious? What do you notice?',
      },
      {
        day: 5, title: 'Seen and Called by Name',
        scripture: 'Luke 19:1–10',
        reflection: 'Zacchaeus climbed a tree to catch a glimpse of Jesus — and Jesus stopped, looked up, and called him by name. Before Zacchaeus did anything, he was already seen. Sit with the image of Jesus looking directly at you, calling you by name, and saying: "I must stay at your house today."',
      },
    ],
  },

  // ─── FIRST WEEK ──────────────────────────────────────────────────────────────
  {
    week: 3, phase: PHASES.FIRST_WEEK,
    title: 'Knowing My Need — Sin and Brokenness',
    grace: 'To feel a growing sorrow for the ways I have turned from God, and a deepening trust that this sorrow leads not to despair but to mercy.',
    background: 'The First Week of the Exercises is not about self-punishment but about honest self-knowledge. Ignatius invites us to see our sin clearly — not to wallow in shame but to understand what we are being saved from. Honesty before God is the beginning of freedom.',
    days: [
      {
        day: 1, title: 'The History of Salvation',
        scripture: 'Ezekiel 18:30–32',
        reflection: '"I take no pleasure in the death of anyone," declares the Lord God. The entire arc of salvation is God\'s persistent pursuit of a people who keep turning away. Before naming your own sin, rest in the longer story: God has never stopped coming after us.',
      },
      {
        day: 2, title: 'The First Sin',
        scripture: 'Genesis 3:1–13',
        reflection: 'The story of the Fall is the story of every human heart: the temptation to be like God on our own terms, to grasp what was not given, to hide from the presence of the One who loves us. Where in your own life do you recognize the same pattern — grasping, hiding, blaming?',
      },
      {
        day: 3, title: 'My Own Sin',
        scripture: 'Psalm 51:1–12',
        reflection: '"Have mercy on me, O God, according to your steadfast love." David prays this after his gravest sin. Notice the sequence: he names the sin clearly, appeals not to his own goodness but to God\'s mercy, and asks not to be hidden from God\'s face. Pray this psalm slowly as your own.',
      },
      {
        day: 4, title: 'A Life Looked Back Upon',
        scripture: 'Luke 15:11–24',
        reflection: 'The prodigal son "came to his senses" when he hit the bottom. Ignatius invites us to look back over our life — not obsessively, but honestly — and notice the pattern of wandering and return. Where have you drifted? What brought you back? What is drawing you now?',
      },
      {
        day: 5, title: 'Before the Cross',
        scripture: 'Romans 5:6–11',
        reflection: '"While we were still sinners, Christ died for us." This is the heart of the First Week: we are not loved because we are good. We are loved despite our brokenness — and that love is proved in the cross. Sit before the image of Christ crucified. What rises in you?',
      },
    ],
  },
  {
    week: 4, phase: PHASES.FIRST_WEEK,
    title: 'Mercy — God\'s Response to My Brokenness',
    grace: 'To receive God\'s mercy not as an abstract truth but as a personal and tender gift — to feel forgiven, not just declared forgiven.',
    background: 'The movement of the First Week is always toward mercy. Ignatius does not want us to remain in guilt but to be transformed by the encounter with a God who forgives completely. This week we receive what was offered at the cross.',
    days: [
      {
        day: 1, title: 'The Father Who Runs',
        scripture: 'Luke 15:20–24',
        reflection: 'The father in the parable does not wait at the door with crossed arms. He sees the son "while he was still a long way off," runs to him, and throws his arms around him. God sees us returning — even when we are still far off — and moves toward us. Let yourself be held.',
      },
      {
        day: 2, title: 'Nothing Can Separate Us',
        scripture: 'Romans 8:31–39',
        reflection: '"Nothing in all creation will be able to separate us from the love of God in Christ Jesus our Lord." Paul lists every possible threat: death, life, angels, demons, present, future, height, depth. Name your own fear of separation from God, and then let this passage speak directly to it.',
      },
      {
        day: 3, title: 'The Woman at the Well',
        scripture: 'John 4:4–26',
        reflection: 'Jesus speaks to a woman who is a social and religious outsider. He knows her full history and still asks for a drink. He offers living water — not after she reforms herself, but in the middle of her story. Bring your full history to this conversation. Let Jesus speak first.',
      },
      {
        day: 4, title: 'Washing Feet',
        scripture: 'John 13:1–17',
        reflection: 'Peter recoils: "You shall never wash my feet." To receive mercy is sometimes harder than to perform penance. Can you let God serve you? Can you hold still and receive care rather than immediately trying to earn it back? Sit with Peter\'s resistance — and then his surrender.',
      },
      {
        day: 5, title: 'A New Heart',
        scripture: 'Ezekiel 36:25–28',
        reflection: '"I will give you a new heart and put a new spirit within you." The promise is not that we will try harder but that we will be changed from the inside. The First Week ends not with our resolution but with God\'s promise. What would it mean to receive a new heart rather than fix the old one?',
      },
    ],
  },

  // ─── SECOND WEEK ─────────────────────────────────────────────────────────────
  {
    week: 5, phase: PHASES.SECOND_WEEK,
    title: 'The Kingdom — Christ\'s Invitation',
    grace: 'To hear Christ\'s call personally — not as a general announcement but as an invitation spoken to me — and to feel a growing desire to respond.',
    background: 'The Second Week begins with the Kingdom Exercise: Ignatius asks us to imagine a great and good king calling people to join a noble mission. Then he turns the image: Christ is that king. The question of the Second Week is not "What should I believe?" but "Who do I want to follow, and how?"',
    days: [
      {
        day: 1, title: 'The Kingdom Exercise',
        scripture: 'Mark 1:14–20',
        reflection: '"Follow me, and I will make you fishers of men." The call is direct, personal, and immediate — and they left everything. Ignatius asks: if a great and good leader called you to join an important mission, would you respond? Now hear Jesus say the same words to you, today, in your actual life. What stirs?',
      },
      {
        day: 2, title: 'Two Standards',
        scripture: 'Luke 4:1–13',
        reflection: 'Ignatius\' "Two Standards" meditation contrasts two strategies: the enemy offers riches, honor, and pride; Christ offers poverty, humility, and solidarity with the suffering. Where are you being drawn toward the first standard — security, status, control — without noticing? Where is Christ calling you differently?',
      },
      {
        day: 3, title: 'Three Kinds of Persons',
        scripture: 'Matthew 19:16–22',
        reflection: 'The rich young man wanted to follow Jesus but could not release his attachment. Ignatius describes three responses to God\'s call: those who intend to respond "someday," those who try to compromise without fully letting go, and those who hold everything lightly and ask only what God wants. Which posture feels most like yours right now?',
      },
      {
        day: 4, title: 'Hearing My Name Called',
        scripture: 'John 10:1–5, 11–15',
        reflection: '"He calls his own sheep by name and leads them out." The shepherd does not drive; he walks ahead and the sheep follow because they know his voice. Spend time today simply listening. What is the shape of the invitation you are hearing — not what you think you should do, but what you actually feel drawn toward?',
      },
      {
        day: 5, title: 'The Cost and the Gift',
        scripture: 'Luke 14:25–33',
        reflection: 'Jesus asks us to count the cost before committing. This is not to discourage but to ensure the commitment is real. What would genuine following require of you — not in theory, but in your actual daily life? And what would you gain that you cannot gain any other way?',
      },
    ],
  },
  {
    week: 6, phase: PHASES.SECOND_WEEK,
    title: 'The Life of Jesus — Contemplating the Word Made Flesh',
    grace: 'To know Jesus more intimately, to love him more deeply, and to follow him more closely.',
    background: 'The heart of the Second Week is contemplation of the Gospel scenes. Ignatius asks us not to analyze but to be present — to enter the scene, see the people, hear the words, and notice what moves within us. We are seeking not information about Jesus but personal encounter with him.',
    days: [
      {
        day: 1, title: 'The Annunciation — God Enters',
        scripture: 'Luke 1:26–38',
        reflection: 'Mary is asked to receive the impossible. Her response — "Let it be done to me according to your word" — is the posture of the entire Exercises. Enter the scene: the angel, the small room, the young woman\'s face. What does it look like when a human being says a complete "yes" to God?',
      },
      {
        day: 2, title: 'Baptism — Beloved',
        scripture: 'Matthew 3:13–17',
        reflection: '"This is my beloved Son, in whom I am well pleased" — spoken before Jesus had done a single miracle. God\'s pleasure is not in performance but in relationship. Hear these words spoken over your own life, at your own baptism. Do you believe them? Where do you find it hardest to receive?',
      },
      {
        day: 3, title: 'The Beatitudes — Upside-Down Kingdom',
        scripture: 'Matthew 5:1–12',
        reflection: 'Jesus\' first great teaching inverts the world\'s logic: the poor, the mourning, the meek are blessed. This is not a consolation prize — it is a description of where God\'s life flows. Where in your own poverty, grief, or humility might God\'s blessing be hidden?',
      },
      {
        day: 4, title: 'Healing Touch',
        scripture: 'Mark 1:40–45',
        reflection: 'The leper says, "If you choose, you can make me clean." Jesus was "moved with pity" and reached out to touch what no one touched. What in you feels untouchable, unclean, too broken to bring forward? Bring it now, with the leper\'s honesty. Watch what Jesus does.',
      },
      {
        day: 5, title: 'Feeding the Multitude',
        scripture: 'John 6:1–15',
        reflection: 'Five loaves, two fish — insufficient by any calculation. Jesus takes what is offered, gives thanks, and it becomes more than enough. What "not enough" are you holding? Offer it — your time, your gifts, your capacity — and watch what God does with what is given freely.',
      },
    ],
  },
  {
    week: 7, phase: PHASES.SECOND_WEEK,
    title: 'Election — Making a Choice with God',
    grace: 'To make — or to renew — a fundamental choice about how I will live, offered freely to God and confirmed by peace.',
    background: 'The Election is the pivot of the Exercises. Ignatius invites us to bring a significant decision or orientation of life before God and to discern, through prayer and the movements of consolation and desolation, what God is calling us toward. For some this is a new decision; for others it is a renewal of a choice already made.',
    days: [
      {
        day: 1, title: 'Discernment of Spirits',
        scripture: 'Galatians 5:16–26',
        reflection: 'Paul describes the "fruit of the Spirit" — love, joy, peace, patience — as the signs of life aligned with God. Ignatian discernment works the same way: the direction that brings deepening peace, generosity, and freedom over time is the direction of God. What fruits are growing in your current path?',
      },
      {
        day: 2, title: 'The Wise Builder',
        scripture: 'Luke 6:46–49',
        reflection: '"Why do you call me Lord, Lord, and do not do what I say?" The person who builds on rock hears and acts. The question of the Election is not "What do I know?" but "What am I willing to do?" What is the solid rock beneath your life? What are you building on that will not hold?',
      },
      {
        day: 3, title: 'Bringing the Decision to Prayer',
        scripture: 'Luke 22:39–44',
        reflection: 'In Gethsemane, Jesus brings his deepest resistance to the Father: "Not my will, but yours." This is not the erasure of his desire but its transformation. Bring your own decision — or the resistance you feel to a decision you already sense is right — and pray in the same way. What does God\'s "yes" feel like in your body?',
      },
      {
        day: 4, title: 'The Deathbed Meditation',
        scripture: 'Ecclesiastes 5:18–20',
        reflection: 'Ignatius suggests imagining yourself at the end of your life, looking back. From that vantage point, what choice would you wish you had made? What did matter, and what turned out not to matter at all? Let that perspective speak into the present.',
      },
      {
        day: 5, title: 'Offering the Choice',
        scripture: 'Romans 12:1–2',
        reflection: '"Offer yourselves as living sacrifices, holy and pleasing to God — this is your true and proper worship." The Election ends in offering: whatever you have discerned, you bring it back to God as a gift. Write it out, pray it aloud, or simply hold it in open hands. The giving is the completion.',
      },
    ],
  },

  // ─── THIRD WEEK ──────────────────────────────────────────────────────────────
  {
    week: 8, phase: PHASES.THIRD_WEEK,
    title: 'The Passion — Love Poured Out',
    grace: 'To grieve with Christ who grieves, to be present to his suffering — not at a distance but as a companion — and to feel the weight of love that does not count the cost.',
    background: 'The Third Week walks with Jesus through his suffering and death. Ignatius does not invite us to explanation or theology but to companionship. We watch, we stay awake, we refuse to look away. The question of the Third Week is not "Why did this happen?" but "Can I remain present to love that costs everything?"',
    days: [
      {
        day: 1, title: 'The Last Supper',
        scripture: 'John 13:1–5, 21–30',
        reflection: 'Jesus knows. He knows what is coming and he still washes feet, still breaks bread, still says "one of you will betray me" with grief rather than condemnation. Enter the room. Feel the weight of what is known and still not spoken fully. Where in your own life does love continue in the face of betrayal?',
      },
      {
        day: 2, title: 'Gethsemane',
        scripture: 'Mark 14:32–42',
        reflection: '"My soul is sorrowful even to death." Three times Jesus asks the disciples to stay awake with him. Three times they sleep. Stay awake today. Sit with Jesus in his terror and aloneness. Do not rush to the resurrection. The willingness to be present to suffering — his or another\'s — is itself a form of love.',
      },
      {
        day: 3, title: 'The Betrayal and Arrest',
        scripture: 'John 18:1–12',
        reflection: '"Whom are you looking for?" Jesus asks, already knowing. He does not run. He steps forward and names himself: "I am he." In the face of arrest and violence, there is a strange authority. How does he hold both vulnerability and freedom in the same moment? Where have you seen that in others?',
      },
      {
        day: 4, title: 'The Cross',
        scripture: 'John 19:16–30',
        reflection: '"It is finished." Ignatius asks us to stay at the foot of the cross in silence. Do not analyze or theologize. Simply be present. Notice what you see: the women who stayed, the beloved disciple, the soldiers. Notice what you feel. Let the weight of love offered and refused and still given be real.',
      },
      {
        day: 5, title: 'Holy Saturday',
        scripture: 'Isaiah 53:3–5',
        reflection: 'The disciples did not know Sunday was coming. They lived through Saturday: grief, confusion, the silence of God. There are Holy Saturdays in every life — seasons of waiting in the dark without certainty that morning comes. Where are you in your own Holy Saturday? Can you stay, without forcing an ending?',
      },
    ],
  },

  // ─── FOURTH WEEK ─────────────────────────────────────────────────────────────
  {
    week: 9, phase: PHASES.FOURTH_WEEK,
    title: 'The Resurrection — New Life',
    grace: 'To rejoice with Christ who rejoices — to receive the resurrection not as a doctrinal truth but as a living encounter that changes how I see everything.',
    background: 'The Fourth Week does not erase the Third. The wounds remain — Thomas touches them. But everything is transformed. Ignatius invites us into the joy of the risen Christ, who appears first to those who loved him most and who continues to appear wherever there is genuine love, truth, and new life.',
    days: [
      {
        day: 1, title: 'Mary at the Tomb',
        scripture: 'John 20:1–18',
        reflection: 'Mary mistakes Jesus for the gardener until he speaks her name. One word — "Mary" — and everything changes. God meets us in our grief, calls us by name, and transforms our weeping. When has God spoken your name in a moment of loss, and what did that voice sound like?',
      },
      {
        day: 2, title: 'The Road to Emmaus',
        scripture: 'Luke 24:13–35',
        reflection: 'Two disciples walk in despair, and Jesus joins them without revealing himself. He walks with them, listens, explains — and is finally recognized in the breaking of bread. Look back at your own journey: where was Jesus present in a conversation, a meal, a moment — before you recognized him?',
      },
      {
        day: 3, title: 'Breakfast on the Shore',
        scripture: 'John 21:1–14',
        reflection: 'The disciples have returned to what they knew before — fishing. And again, a stranger calls from the shore, and the nets overflow. Jesus prepares breakfast on a charcoal fire. It is tender, ordinary, and unmistakably him. The resurrection appears in the most everyday moments. Where are you seeing it?',
      },
      {
        day: 4, title: 'Do You Love Me?',
        scripture: 'John 21:15–19',
        reflection: 'Three times Jesus asks Peter: "Do you love me?" Three times, reversing the three denials. Jesus does not review Peter\'s failure; he replaces it with a new commission. What old failure is God looking at now, not to condemn but to redeem? Can you hear the question asked tenderly rather than accusingly?',
      },
      {
        day: 5, title: 'The Gift of Peace',
        scripture: 'John 20:19–23',
        reflection: '"Peace be with you." Twice, to frightened disciples behind locked doors. He shows his wounds, breathes on them, and sends them. Peace in the New Testament is not the absence of difficulty but the presence of God in the middle of it. What locked room in your life is Jesus asking to enter?',
      },
    ],
  },
  {
    week: 10, phase: PHASES.FOURTH_WEEK,
    title: 'Contemplatio — Love in Action',
    grace: 'To love and serve in all things; to find God in every person, event, and moment; and to carry the graces of this retreat into the whole of my life.',
    background: 'The Exercises end not with withdrawal from the world but with return to it — transformed. The Contemplatio ad Amorem (Contemplation to Attain Love) is Ignatius\' final prayer: seeing God\'s gifts, receiving them with gratitude, and offering everything in return. Love, he says, shows itself in deeds more than words.',
    days: [
      {
        day: 1, title: 'God in All Things',
        scripture: 'Acts 17:27–28',
        reflection: '"In him we live and move and have our being." Paul quotes a pagan poet to say what the mystics say: God is not absent from creation but present within it, sustaining everything at every moment. Go through your ordinary day today looking for that sustaining Presence. Where did you find it?',
      },
      {
        day: 2, title: 'Gifts and Gratitude',
        scripture: 'James 1:17',
        reflection: '"Every good gift and every perfect gift is from above." Ignatius begins the Contemplatio by recalling all the gifts received: creation, redemption, particular graces. Name your own. Name the people, the moments, the gifts that have shaped you into who you are. The naming is itself a prayer.',
      },
      {
        day: 3, title: 'Suscipe — Take and Receive',
        scripture: 'Philippians 4:11–13',
        reflection: 'The great prayer of surrender: "Take, Lord, and receive all my liberty, my memory, my understanding, and my entire will — all that I have and possess. You have given it all to me; to you, Lord, I return it. Everything is yours; dispose of it entirely according to your will. Give me only your love and your grace — that is enough for me."',
      },
      {
        day: 4, title: 'God Labors in All Things',
        scripture: 'John 5:17',
        reflection: '"My Father is always at his work to this very day, and I too am working." Ignatius sees God not as a distant architect but as the one who labors in history, in creation, in the details of your life. Where is God at work right now — in your work, your family, your neighborhood, your world?',
      },
      {
        day: 5, title: 'Sent',
        scripture: 'John 20:21',
        reflection: '"As the Father has sent me, I am sending you." The Exercises end here: not with a private spiritual experience but with a mission. You are sent — into your ordinary life, your relationships, your work — as one who has been with Jesus. What do you carry back? How will you live differently? What is the one thing you want to remember?',
      },
    ],
  },
];

export default schedule
