const userController = require('./controllers/user.controller')
const userModel = require('./models/user.model')
const chatController = require('./controllers/chat.controller')
const chatModel = require('./models/chat.model')

async function go() {
    require('dotenv').config()
    require('./db').connect()
    await userModel.collection.drop()
    await chatModel.collection.drop()

    console.log("###########  START  #########");

    const users = [
        {
            email: "user1@example.com",
            userName: "Moshe Cohen",
            password: "123qwe",
            image: "https://newprofilepic.photo-cdn.net//assets/images/article/profile.jpg?90af0c8",
            chats: [],
        },
        {
            email: "user2@example.com",
            userName: "Haim Levi",
            password: "123456",
            image: "https://images.ctfassets.net/h6goo9gw1hh6/2sNZtFAWOdP1lmQ33VwRN3/24e953b920a9cd0ff2e1d587742a2472/1-intro-photo-final.jpg?w=1200&h=992&fl=progressive&q=70&fm=jpg",
            chats: [],
        },
        {
            email: "user3@example.com",
            userName: "Mor Noam",
            password: "123qwe",
            image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbfKhOuGk_Ag_8BBQ5Kc0xi1pAXxGNGP9JYQ&usqp=CAU",
            chats: [],
        },
        {
            email: "user4@example.com",
            userName: "Sivan Tov",
            password: "123qwe21s",
            image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRGCg4pLQ1ckWPPMqf4s4eLyiKKMUU9bpjtA&usqp=CAU",
            chats: [],
        },
        {
            email: "user5@example.com",
            userName: "Roni Malkan",
            password: "23w32q",
            image: "https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg",
            chats: [],
        },
        {
            email: "user6@example.com",
            userName: "Smadar Omer",
            password: "123qwe",
            image: "https://wallpapers.com/images/hd/cool-profile-picture-minion-13pu7815v42uvrsg.jpg",
            chats: [],
        },

    ]

    let ru1 = await userController.createUser(users[0])
    let ru2 = await userController.createUser(users[1])
    let ru3 = await userController.createUser(users[2])
    let ru4 = await userController.createUser(users[3])
    let ru5 = await userController.createUser(users[4])
    let ru6 = await userController.createUser(users[5])
    // let ru7 = await userController.createUser(users[6])

    const members = [ru1, ru2, ru3, ru4, ru5, ru6];

    const chats = [
        {
            subject: "Hello, how are you?",
            members: [ru1._id, ru2._id, ru4._id, ru6._id],
            messages: [{
                from: ru2._id,
                date: "2024-03-21T10:00:00.000Z",
                content: "Greeting and you??",

            }, {
                from: ru1._id,
                date: "2024-03-21T10:08:00.000Z",
                content: "Fine, and you?",
            }, {
                from: ru6._id,
                date: "2024-03-21T10:24:00.000Z",
                content: "Walla Sababa !!",
            },],
            lastDate: "2024-03-21T10:24:00.000Z"
        },
        {
            subject: "Report Request",
            members: [ru2._id, ru3._id, ru4._id, ru5._id, ru6._id],
            messages: [{
                from: ru3._id,
                date: "2024-03-20T09:30:00.000Z",
                content: "Could you please send me the report?",
            },
            {
                from: ru2._id,
                date: "2024-03-20T10:45:00.000Z",
                content: "whyyyyy?!?!",
            }, {

                from: ru3._id,
                date: "2024-03-20T10:57:00.000Z",
                content: "why whyyyyyyy?!?!",
            }, {
                from: ru6._id,
                date: "2024-03-21T07:30:00.000Z",
                content: "Ok, i'm fired!",
            },],
            lastDate: "2024-03-21T07:30:00.000Z"
        },
        {
            subject: "Meeting Reminder",
            members: [ru2._id, ru3._id],
            messages: [
                {
                    from: ru2._id,
                    date: "2024-04-08T11:00:00.000Z",
                    content: "Just a reminder about our meeting tomorrow.",
                },
                {
                    from: ru3._id,
                    date: "2024-04-08T11:05:00.000Z",
                    content: "Thanks for the heads-up. Looking forward to it!",
                }
            ],
            lastDate: "2024-04-08T11:05:00.000Z"
        },
        {
            subject: "Vacation Plans",
            members: [ru5._id, ru6._id],
            messages: [
                {
                    from: ru5._id,
                    date: "2024-04-08T12:00:00.000Z",
                    content: "I'm thinking of taking a vacation next month.",
                },
                {
                    from: ru6._id,
                    date: "2024-04-08T12:10:00.000Z",
                    content: "That sounds like a great idea! Where are you planning to go?",
                }
            ],
            lastDate: "2024-04-08T12:10:00.000Z"
        },
        {
            subject: "New Feature Discussion",
            members: [ru1._id, ru3._id, ru4._id],
            messages: [
                {
                    from: ru1._id,
                    date: "2024-04-08T13:00:00.000Z",
                    content: "I have some ideas for a new feature. Can we discuss?",
                },
                {
                    from: ru3._id,
                    date: "2024-04-08T13:15:00.000Z",
                    content: "Sure! Let's schedule a meeting to brainstorm.",
                },
                {
                    from: ru4._id,
                    date: "2024-04-08T13:30:00.000Z",
                    content: "Count me in! I'm excited to hear your ideas.",
                }
            ],
            lastDate: "2024-04-08T13:30:00.000Z"
        },
        {
            subject: "Team Building Event",
            members: [ru2._id, ru5._id, ru6._id],
            messages: [
                {
                    from: ru2._id,
                    date: "2024-04-08T14:00:00.000Z",
                    content: "Let's organize a team-building event next month.",
                },
                {
                    from: ru5._id,
                    date: "2024-04-08T14:15:00.000Z",
                    content: "That sounds like a fantastic idea! Any suggestions?",
                },
                {
                    from: ru6._id,
                    date: "2024-04-08T14:30:00.000Z",
                    content: "I'll check some options and get back to you.",
                }
            ],
            lastDate: "2024-04-08T14:30:00.000Z"
        },
        {
            subject: "Budget Discussion",
            members: [ru1._id, ru2._id, ru4._id],
            messages: [
                {
                    from: ru1._id,
                    date: "2024-04-08T15:00:00.000Z",
                    content: "We need to discuss the budget for the upcoming project.",
                },
                {
                    from: ru2._id,
                    date: "2024-04-08T15:15:00.000Z",
                    content: "Agreed. Let's schedule a meeting to review.",
                },
                {
                    from: ru4._id,
                    date: "2024-04-08T15:30:00.000Z",
                    content: "I'll prepare the necessary documents for the meeting.",
                }
            ],
            lastDate: "2024-04-08T15:30:00.000Z"
        }]

    const chatDB = []
    for (e of chats) {
        let ee = await chatController.createChat(e)
        let first = members.find(m => m._id == ee.messages[0].from);

        first.chats.push({
            chat: ee._id,
            isSent: true,
            isRecieved: ee.members.includes(first._id, 1),
        })
        await first.save();

        ee.members
            .filter(m => m._id != first._id)
            .forEach(async m =>{
                let mm = members.find(mem=>mem._id==m._id)
                mm.chats.push({
                    chat: ee._id,
                    isRecieved: true,
                })
                await mm.save()
            })
        chatDB.push(ee)
    }

    console.log("###########  END  ##########");

}

go()


// async function go() {
//     require('dotenv').config()
//     require('./db').connect()
//     await userModel.collection.drop()
//     await chatModel.collection.drop()

//     console.log("###########  START  #########");

//     const users = [
//         {
//             email: "user1@example.com",
//             userName: "Moshe Cohen",
//             password: "123qwe",
//             image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3HdBqVDU45zUIDYvJbH1QE2kosJ0VrH0KEXee3n33PnskjPbyvDAUWYrChTGjCXHA2cc&usqp=CAU",
//             chats: [],
//         },
//         {
//             email: "user2@example.com",
//             userName: "Haim Levi",
//             password: "123456",
//             image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3HdBqVDU45zUIDYvJbH1QE2kosJ0VrH0KEXee3n33PnskjPbyvDAUWYrChTGjCXHA2cc&usqp=CAU",
//             chats: [],
//         },
//         {
//             email: "user3@example.com",
//             userName: "Mor Noam",
//             password: "123qwe",
//             image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3HdBqVDU45zUIDYvJbH1QE2kosJ0VrH0KEXee3n33PnskjPbyvDAUWYrChTGjCXHA2cc&usqp=CAU",
//             chats: [],
//         },
//     ]

//     let ru1 = await userController.createUser(users[0])
//     let ru2 = await userController.createUser(users[1])
//     let ru3 = await userController.createUser(users[2])

//     const messages = [{
//         from: ru2._id,
//         date: "2024-03-21T10:00:00.000Z",
//         content: "Greeting and you??",

//     }, {
//         from: ru1._id,
//         date: "2024-03-21T10:08:00.000Z",
//         content: "Fine, and you?",
//     }, {
//         from: ru2._id,
//         date: "2024-03-21T10:24:00.000Z",
//         content: "Walla Sababa!!",
//     },


//     // --------------------------------------
//     {
//         from: ru3._id,
//         date: "2024-03-20T09:30:00.000Z",
//         content: "Could you please send me the report?",
//     },
//     {
//         from: ru2._id,
//         date: "2024-03-20T10:45:00.000Z",
//         content: "whyyyyy?!?!",
//     }, {

//         from: ru3._id,
//         date: "2024-03-20T10:57:00.000Z",
//         content: "why whyyyyyyy?!?!",
//     }, {
//         from: ru2._id,
//         date: "2024-03-21T07:30:00.000Z",
//         content: "Ok, i'm fired!",
//     },

//         // -------------------------------------
//     ]

//     const chats = [{
//         subject: "Hello, how are you?",
//         to: [ru1._id, ru2._id],
//         messages: [msg[0], msg[1], msg[2]],
//         lastDate: "2024-03-21T10:24:00.000Z"
//     }, {
//         subject: "Report Request",
//         to: [ru2._id, ru3._id],
//         messages: [msg[3], msg[4], msg[5], msg[6]],
//         lastDate: "2024-03-21T07:30:00.000Z"
//     }]

//     const chatDB = []
//     for (e of chats) {
//         let ee = await chatController.createChat(e)
//         chatDB.push(ee)
//     }


//     ru1.chats.push({
//         chat: chatDB[0]._id,
//         isInbox: true,
//         isSent: true,
//         isFavorite: false,
//         isDraft: false,
//         isDeleted: false,
//         labels: [
//             { color: "#134435", title: 'work' },
//             { color: "#324435", title: 'Promising offers' },
//             { color: "#234435", title: 'Work in progres' },
//             { color: "#534435", title: 'In acceptance' },
//             { color: "#434435", title: 'Read later' },
//         ],
//     })

//     ru1.save()

//     ru2.chats.push({
//         chat: chatDB[0]._id,
//         isInbox: true,
//         isSent: true,
//         isFavorite: false,
//         isDraft: false,
//         isDeleted: false,
//         labels: [
//             { color: "#134435", title: 'work' },
//             { color: "#324435", title: 'Promising offers' },
//             { color: "#234435", title: 'Work in progres' },
//             { color: "#534435", title: 'In acceptance' },
//             { color: "#434435", title: 'Read later' },
//         ],
//     },
//         {
//             chat: chatDB[1]._id,
//             isInbox: true,
//             isSent: true,
//             isFavorite: false,
//             isDraft: false,
//             isDeleted: false,
//             labels: [
//                 { color: "#134435", title: 'work' },
//                 { color: "#324435", title: 'Promising offers' },
//                 { color: "#234435", title: 'Work in progres' },
//                 { color: "#534435", title: 'In acceptance' },
//                 { color: "#434435", title: 'Read later' },
//             ],
//         })
//     ru2.save()

//     ru3.chats.push({
//         chat: chatDB[1]._id,
//         isInbox: true,
//         isSent: true,
//         isFavorite: false,
//         isDraft: false,
//         isDeleted: false,
//         labels: [
//             { color: "#134435", title: 'work' },
//             { color: "#324435", title: 'Promising offers' },
//             { color: "#234435", title: 'Work in progres' },
//             { color: "#534435", title: 'In acceptance' },
//             { color: "#434435", title: 'Read later' },
//         ],
//     })
//     ru3.save()

//     console.log("###########  END  ##########");

// }