const genareteMessage = (username, text)=>{
    return {
        username,
        text,
        createdAt : new Date().getTime()
    }

}

const genareteLocationMessage = (username, url)=>{
    return {
        username,
        url,
        createdAt : new Date().getTime(),
      
    }

}
module.exports = {
    genareteMessage,
    genareteLocationMessage
}