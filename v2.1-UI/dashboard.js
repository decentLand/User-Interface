const arweave = Arweave.init({
    host: "arweave.net",
    protocol: "https"
});
let isLogged = false
const readState = smartweave.readContract;
let swc;

async function arweaveNetwork() {
    const network = await arweave.network.getInfo()
    document.getElementById("blocks").innerHTML = `Blocks: ${network["blocks"]}`
    document.getElementById("height").innerHTML = `Height: ${network["height"]}`
    document.getElementById("peers").innerHTML = `Peers: ${network["peers"]}`
}

async function loadContract() {
    swc = await readState(arweave, "x0UlfULWsYGNttZf4QTIEuIvedjsYQtaHh_yOfyhOWg")
    return
}
async function decentlandProtocol(){
    const swc = await readState(arweave, "x0UlfULWsYGNttZf4QTIEuIvedjsYQtaHh_yOfyhOWg")
    document.getElementById("users").innerHTML = `Registered Users: ${Object.keys(swc["users"]).length}`
    document.getElementById("minted-usernames").innerHTML = `Minted Usernames: ${swc["mintedTokens"].length}`
    document.getElementById("last-username").innerHTML = `Last Minted Username: @${swc["mintedTokens"][swc["mintedTokens"].length - 1]}`


}

async function signup() {
    
    if (!isLogged) {
        swal({title: "Undetected Wallet", text: "Please login using arconnect.io wallet", icon: "error"})
        return
    }
    const username = document.getElementById("username").value
    const bio = document.getElementById("bio").value
    let pfp = document.getElementById("pfp").value
    const friendzone = Number(document.getElementById("friendzone").value)

    for (let char of username) {
        if (char.charCodeAt(0) < 97 || char.charCodeAt(0) > 122){
            swal({title: "Input Error", text: "invalid character inserted. Only lowercase alphabetical letters", icon: "error"})
            return
        }
    }

    if (username.length < 1 || username.length > 7 || typeof username !== "string") {
        swal({title: "Input Error", text: "Invalid username", icon: "error"})
        return
    }

    if (bio.length > 75 || typeof username !== "string") {
        swal({title: "Input Error", text: "Invalid username", icon: "error"})
        return
    }

    if (pfp.length === 0) {
        pfp = "78WdrVhNZ2i_KbimqcV4j-drX04HJr3E6UyD7xWc84Q"
    }

    if (!(Number.isInteger(friendzone))) {
        swal({title: "Input Error", text: "Only integer values are allowed for Friendzone", icon: "error"})
        return
    }

    if (friendzone < 10 || friendzone > 90) {
        swal({title: "Input Error", text: "friendzone % must be between 10-90", icon: "error"})
        return
    }

    const tx = await arweave.createTransaction({
        data: `${username} registration`
    })

    tx.addTag("Content-Type", "text/plain")
    tx.addTag("App-Name", "SmartWeaveAction")
    tx.addTag("App-Version", "0.3.0")
    tx.addTag("Contract-Src", "x0UlfULWsYGNttZf4QTIEuIvedjsYQtaHh_yOfyhOWg")
    tx.addTag("input", `{"function": "signup", "username": "${username}", "bio": "${bio}", "friendzonePercentage": ${friendzone}, "pfp": "${pfp}"}`)

    await arweave.transactions.sign(tx)
    swal({title: "Registration", text: `Register TX Sent Successfully: ${tx.id}`, icon: "success"})
    console.log(tx)
}

async function linkArconnect() {
    
    if (! await window.arweaveWallet) {
        swal({title: "Arconnect Not Found", text: "Please download Arconnect from arconnect.io", icon: "error"})
        return
    }
    await window.arweaveWallet.connect(["ACCESS_ADDRESS", "ACCESS_ALL_ADDRESSES", "SIGN_TRANSACTION"]);
    const address = await window.arweaveWallet.getActiveAddress();
    pubkey = address
    document.getElementById("button-connect").innerText = "logout 🚪"
    document.getElementById("button-connect").setAttribute("onClick", "logout()")
    document.getElementById("address").innerText = `active wallet: ${address}`
    isLogged = true
}

async function logout() {
    await window.arweaveWallet.disconnect();
    document.getElementById("button-connect").innerText = "Connect Arconnect 🦔 "
    document.getElementById("address").innerText = ''
    document.getElementById("button-connect").setAttribute("onClick", "linkArconnect()")
    isLogged = false
}

async function checkUsername() {
    const username = document.getElementById("check-username").value
    
    if (username.length === 0 ) {
        swal({title: "Search Error", text: "please input a username", icon: "error"})
        return
    }
    
    document.getElementById("loader").innerHTML = `checking username... Please wait`
    const usernameContract = await readState(arweave, "x0UlfULWsYGNttZf4QTIEuIvedjsYQtaHh_yOfyhOWg")

        for (let char of username) {
        if (char.charCodeAt(0) < 97 || char.charCodeAt(0) > 122){
            swal({title: "Search Error", text: "invalid character inserted. Only lowercase alphabetical letters", icon: "error"})
            return
        }
    }

    if (username.length < 1 || username.length > 7 || typeof username !== "string") {
        swal({title: "Search Error", text: "invalid username type/length", icon: "error"})
        return
    }

    if (usernameContract["mintedTokens"].includes(username)) {
        const token = getUsernameTokenType(username)

        for (let user in usernameContract["users"]) {
            console.log(user)
            if (token in usernameContract["users"][user]["tokens"]) {
                if (usernameContract["users"][user]["tokens"][token]["usernames"].includes(username)) {
                    document.getElementById("loader").innerHTML =
                     `<b>@${username}</b> is owned by <a href="https://viewblock.io/arweave/address/${user}">${user}</a>`
                }
            }
        }
        
        
    } else {
        document.getElementById("loader").innerHTML = `<p>unminted username</p>`
    }
}

async function mint() {
    const username = document.getElementById("mint-username").value;

    if (! swc) {
        await loadContract()
    }

    if (! isLogged) {
        swal({title: "Undetected Wallet", text: "Please login using arconnect.io wallet", icon: "error"})
        return
    }

    if (! swc["users"][pubkey]) {
        swal({title: "Contract Error", text: "Please register to be able to mint a username", icon: "error"})
        return
    }

    if (swc["users"][pubkey]["hasMinted"]) {
        swal({title: "Contract Error", text: "You have already minted an username", icon: "error"})
        return
    }

    if (username.length > 7 || username.length < 1) {
        swal({title: "Input Error", text: "username must be between 1 and 7 characters", icon: "error"})
        return
    }

    if (swc["mintedTokens"].includes(username)) {
        swal({title: "Input Error", text: `username @${username} has been already minted`, icon: "error"})
        return
    }

    tx.addTag("Content-Type", "text/plain")
    tx.addTag("App-Name", "SmartWeaveAction")
    tx.addTag("App-Version", "0.3.0")
    tx.addTag("Contract-Src", "x0UlfULWsYGNttZf4QTIEuIvedjsYQtaHh_yOfyhOWg")
    tx.addTag("input", `{"function": "mint", "username": "${username}"}`)

    await arweave.transactions.sign(tx)
    swal({title: "Registration", text: `Minting TX Sent Successfully: ${tx.id}`, icon: "success"})
    console.log(tx)

}

function getUsernameTokenType(username) {
    let token;

    switch (username.length) {
        case 1:
            token = "ichi"
            break
        case 2:
            token = "ni"
            break
        case 3:
            token = "san"
            break
        case 4:
            token = "shi"
            break
        case 5:
            token = "go"
            break
        case 6:
            token = "roku"
            break
        case 7:
            token = "shichi"
            break
        }

    return token
}

setInterval(arweaveNetwork, 1000)
decentlandProtocol()
loadContract()
