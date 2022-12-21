/*

Key and door objective
Pick up a key to unlock door

*/

// Canvas properties
const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.height = 1080
canvas.width = 1920
 
c.fillStyle = 'white'
c.fillRect(0, 0, canvas.width, canvas.height)


// Vars
const offset = {x: -100, y: -1050} // Player starting position


// Media
const image = new Image()
image.src = '/media/images/game-1/map.png'

const playerDownImage = new Image()
playerDownImage.src = '/media/images/shared/player/spritesheet.png'

const playerUpImage = new Image()
playerUpImage.src = '/media/images/shared/player/playerUp.png'

const playerLeftImage = new Image()
playerLeftImage.src = '/media/images/shared/player/playerLeft.png'

const playerRightImage = new Image()
playerRightImage.src = '/media/images/shared/player/playerRight.png'

const foregroundImage = new Image()
foregroundImage.src = '/media/images/game-1/map/foregroundObjects.png'

const crystalImage = new Image()
crystalImage.src = '/media/images/crystal.png'


// Sprites
const player = new Sprite({
    position: {
        // 192 x 86 character dimensions
        x: (canvas.width / 2 - 96 / 4 / 2), // For centering char in middle of the screen
        y: (canvas.height / 2 - 128 / 2)
    },
    image: playerDownImage,
    frames: {
        xmax: 3,
        ymax: 3.975
    },
    scale: 3
})

const crystal = new Sprite({
    position: {
        x: player.position.x, 
        y: player.position.y
    },
    image: crystalImage,
    frames: {
        xmax: 3,
        ymax: 1
    },
    velocity: 20,
    scale: 3
})

const background = new Sprite({
    position: {
        x: offset.x,
        y: offset.y
    },
    image: image,
})

const foreground = new Sprite({
    position: {
        x: offset.x,
        y: offset.y
    },
    image: foregroundImage
})

var tool

function makeTool() {
    const weapon = new Image()
    weapon.src = '/media/images/shared/tools/embySprite2.png'

    tool = new Sprite({
        position: {
            // 192 x 86 character dimensions
            x: player.position.x, 
            y: player.position.y
        },
        image: weapon,
        frames: {
            max: 4
        },
        sprites: {
            w: playerUpImage,
            a: playerLeftImage,
            d: playerRightImage,
            s: playerDownImage
        }
    })
}


crystal.moving = true


// Classes
const input = new Input()
const draw = new Draw()
const boundaries = new Zone(greenData)
const keyZones = new Zone(keyZoneData)
const keyDropZones = new Zone(keyDropData)

// Updated elements
const drawnElements = [background, player, foreground, crystal, boundaries, keyZones, keyDropZones]
const moveableElements = [background, crystal, ...boundaries.zone, foreground, ...keyDropZones.zone, ...keyZones.zone]




var holding = false
function toolPickup() {
    holding = true
    makeTool()
    drawnElements.push(tool)
}
function toolDrop() {
    holding = false
    removeFromArray(drawnElements, tool)
}

function removeFromArray(arr, value) {
    var index = arr.indexOf(value);
    if (index > -1) {
        arr.splice(index, 1);
    }
}
  

 
// Core loop
function animate() {
    const animationId = window.requestAnimationFrame(animate)

    // Initial
    draw.drawElements(drawnElements)
    player.moving = false


    // Zone check
    if (keyZones.collision()) {
        if (!holding) {
            toolPickup()
        }
    }

    // Drop check (it's located right below the pickup row)
    if (keyDropZones.collision()) {
        if (holding) {
            toolDrop()
            uninit(animationId)
        }
    }

    
    // Movement
    if (input.getPressed(['w', 'a', 's', 'd'])) {
        // Update player sprite
        var key = input.lastKey
        player.frames.yval = input.keys[key].yval
        player.moving = true

        // Future position
        const speed = 3
        var x = (input.keys[key].positions.x * speed) || 0
        var y = (input.keys[key].positions.y * speed) || 0

        // Collision conditions
        if (boundaries.collision(x, y)) {
            console.log('collide')
            player.moving = false 
            return
        } 

        draw.moveElements(moveableElements, x, y)
    }
}



// Setup and removal
function uninit(animationId) {
    window.cancelAnimationFrame(animationId)

    gsap.to('#inner', {
        opacity: 1,
        repeat: 3,
        yoyo: true,
        duration: 0.4,
        onComplete() {
            // solid black
            gsap.to('#inner', {
                opacity: 1,
                duration: 0.4,
                onComplete() {
                    localStorage.setItem('Portfolio', 'unlocked');
                    window.location.href = "/html/map.html"
                }
            })
        }
    })
}

function init() {
    // Init
    window.addEventListener('keydown', function(e) {
    input.keydown(e)
    })
    window.addEventListener('keyup', function(e) {
    input.keyup(e)
    })
    animate()
}

init()
