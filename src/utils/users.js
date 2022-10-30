const users = []

const addUser = ({id, username, room})=>{
    //clean the data
    username =username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // valdiate teh data 
    if(!username || !room){
        return {
            error: 'Username and room are required'
        }
    }

    //check for existing user
    const existingUser = users.find((user) =>{
        return user.room == room && user.username == username
    })
    // validate user name  Checks if there is already a user with this name
    if(existingUser){
        return {
            error: 'Username is use !'
        }
    }

    // sture user 
    const user = {id, username, room}
    users.push(user)
    return {user}

}

const removeUser = (id)=>{
    const index = users.findIndex((user) => user.id === id)
    if(index !== -1){
        return users.splice(index,1)[0]
    }

}


// return the user with the same id
const getUser = (id)=>{
    return users.find((ele) => ele.id === id)
}

// retuen all the user are in the same room
const getUsersInRoom = (room) =>{
    room = room.trim().toLowerCase()
   return users.filter(ele => ele.room === room)
   
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}
