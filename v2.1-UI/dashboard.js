const arweave = Arweave.init({
    host: "arweave.net",
    protocol: "https"
});
let isLogged = false
const readState = smartweave.readContract;

async function arweaveNetwork() {
    const network = await arweave.network.getInfo()
    document.getElementById("blocks").innerHTML = `Blocks: ${network["blocks"]}`
    document.getElementById("height").innerHTML = `Height: ${network["height"]}`
    document.getElementById("peers").innerHTML = `Peers: ${network["peers"]}`
}

async function decentlandProtocol(){
    const swc = await readState(arweave, "RUsVtU-kywFWf63XivMPPM2o3hmP7xRQYdlwEk52paA")
    document.getElementById("users").innerHTML = `Registered Users: ${Object.keys(swc["users"]).length}`
    document.getElementById("minted-usernames").innerHTML = `Minted Usernames: ${swc["mintedTokens"].length}`
    document.getElementById("last-username").innerHTML = `Last Minted Username: @${swc["mintedTokens"][swc["mintedTokens"].length - 1]}`


}
decentlandProtocol()

async function signup() {
    
    if (!isLogged) {
        swal({title: "Undetected Wallet", text: "Please login using arconnect.io wallet", icon: "error"})
        return
    }
    const username = document.getElementById("username").value
    const bio = document.getElementById("bio").value
    let pfp = document.getElementById("pfp").value
    const friendzone = document.getElementById("friendzone").value

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
    tx.addTag("Contract-Src", "RUsVtU-kywFWf63XivMPPM2o3hmP7xRQYdlwEk52paA")
    tx.addTag("input", `{"function": "signup", "username": "${username}", "bio": "${bio}", "friendzonePercentage": ${friendzone}, "pfp": "${pfp}"}`)

    await window.arweaveWallet.sign(tx);
    swal({title: "Registration", text: `Register TX Sent Successfully: ${tx.id}`, icon: "success"})
    console.log(tx)
}



async function linkArconnect() {
    await window.arweaveWallet.connect(["ACCESS_ADDRESS", "ACCESS_ALL_ADDRESSES", "SIGN_TRANSACTION"]);
    const address = await window.arweaveWallet.getActiveAddress();
    document.getElementById("button-connect").innerText = "logout 🚪"
    document.getElementById("button-connect").setAttribute("onClick", "logout()")
    document.getElementById("address").innerText = `active wallet: ${address}`
}

async function logout() {
    await window.arweaveWallet.disconnect();
    document.getElementById("button-connect").innerText = "Connect Arconnect 🦔 "
    document.getElementById("address").innerText = ''
    document.getElementById("button-connect").setAttribute("onClick", "linkArconnect()")

}

async function checkUsername() {
    document.getElementById("loader").innerHTML = `checking username... Please wait`
    const usernameContract = await readState(arweave, "RUsVtU-kywFWf63XivMPPM2o3hmP7xRQYdlwEk52paA")
    
    const username = document.getElementById("check-username").value
        for (char of username) {
        if (char.charCodeAt(0) < 97 || char.charCodeAt(0) > 122){
            alert("invalid character inserted. Only lowercase alphabetical letters")
            return
        }
    }

    if (username.length < 1 || username.length > 7 || typeof username !== "string") {
        alert("invalid username type")
        return
    }

    if (usernameContract["mintedTokens"].includes(username)) {
        document.getElementById("loader").innerHTML = `<p>username not available</p>`
    } else {
        document.getElementById("loader").innerHTML = `<p>username available, check if you can still mint !</p>`
    }
}


setInterval(arweaveNetwork, 1000)
