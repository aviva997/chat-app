
const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {genareteMessage, genareteLocationMessage} = require('./utils/messages')
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')


const app = express()
const server = http.createServer(app)
const io = socketio(server)


const port = process.env.PORT || 3000
const publicDirectory = path.join(__dirname,'../public')

app.use(express.static(publicDirectory) )

// let count = 0


///Print new connection 
io.on('connection', (socket) =>{
    console.log('New Webt connection')

 
    socket.on('join',(options, callback)=>{
        const {error, user} = addUser({ id: socket.id, ...options})
        if(error){
           return callback(error)
        }

        socket.join(user.room)
        //the server send message
        socket.emit('message',genareteMessage('Admin','Welcome!'))
        //broadcast - Sending to everyone in the same room except the one who is already there
        socket.broadcast.to(user.room).emit('message', genareteMessage('Admin',`${user.username} has join`))
        io.to(user.room).emit('roomData',{
            room: user.room,
            users: getUsersInRoom(user.room)
        } )

        callback()
    })

    // the sever get message
    socket.on('sendMessage', (message, callback) =>{
        const user = getUser(socket.id)
        const filter = new Filter()

        //Checks if there is profanity in the message
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed')

        }
        io.to(user.room).emit('message',genareteMessage(user.username, message))//the server send the message to all the user with the same room
        callback() //send only to the sender that messahe delivered 

    })

    socket.on('sendLocation',(message, callback) =>{
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', genareteLocationMessage(user.username,`https://google.com/maps?q=${message.longitude},${message.latitude}`))
        callback('Location shared!')
    })

     // send message when user exited
    socket.on('disconnect', ()=> {

        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message', genareteMessage('Admin',`${user.username} has left!`))
            io.to(user.room).emit('roomData',{
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }

    })
})

app.get('', (req, res) => {

    res.render('index', {
        name: 'Chat-App'
    })
})



server.listen(port, () => {
    console.log(`Server listen port ${port}`)

})



