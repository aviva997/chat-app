const socket = io() //connect new client

//Elements
const $messageForm =  document.querySelector('#message-form')
const $messageFromInput =  $messageForm.querySelector('input')
const $messageFromButton =  $messageForm.querySelector('button')
const $sendLocation = document.querySelector('#send-location')
const $message = document.querySelector('#message')




//Template 

const messageTemlate = document.querySelector('#message-template').innerHTML
const locationTamplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options  - for get the username and the room name 
const {username, room}= Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = () => {
    // New message element
    const $newMessage = $message.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $message.offsetHeight

    // Height of messages container
    const containerHeight = $message.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $message.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $message.scrollTop = $message.scrollHeight
    }
}


// listen to the server  send the message to the users
socket.on('message', (message) =>{
    const html = Mustache.render(messageTemlate,{
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
        
    })
    $message.insertAdjacentHTML('beforeend',html)
    
    autoscroll()
    
})

// listen to the server  send the location message to the users
socket.on('locationMessage', (url) =>{
    console.log(url)
    const html = Mustache.render(locationTamplate,{
        username: url.username,
        url: url.url,
        createdAt: moment(url.createdAt).format('h:mm a')
    })
    $message.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData',({room, users}) => {
    
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})
// send message to the server
$messageForm.addEventListener('submit', (e)=> {
    e.preventDefault()
    $messageFromButton.setAttribute('disabled','disabled')
    const message = e.target.elements.message.value

    socket.emit('sendMessage',message, (erro)=>{
        $messageFromButton.removeAttribute('disabled')
        $messageFromInput.value = ' '
        $messageFromInput.focus()
        if(erro){
            return console.log(erro)
        }
        console.log('Message Delivered!')
    })
})

$sendLocation.addEventListener('click', ()=> {
    if(!navigator.geolocation){
        return alert('GeoLocation is not supprted by your browser.')
    }
    $sendLocation.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position)=> {
        const message = {
            longitude:position.coords.longitude,
            latitude:position.coords.latitude
        }
        socket.emit('sendLocation',message, (message)=>{
            console.log(message)
            $sendLocation.removeAttribute('disabled')

        })



    })
})

socket.emit('join', {username, room}, (error) =>{
    if(error){
        alert(error)
        location.href = '/' // send to the main page
    }
})