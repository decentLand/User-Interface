const arweave = Arweave.init({
	host: "arweave.net",
	protocol: "https"
})

let status = false;

async function linkArconnect() {
    await window.arweaveWallet.connect(["ACCESS_ADDRESS", "ACCESS_ALL_ADDRESSES", "SIGN_TRANSACTION"]);
    const address = await window.arweaveWallet.getActiveAddress();
    document.getElementById("button-connect").innerText = "logout 🚪"
    document.getElementById("button-connect").setAttribute("onClick", "logout()")
    document.getElementById("address").innerText = `active wallet: ${address}`
    status = true;
}

async function logout() {
    await window.arweaveWallet.disconnect();
    document.getElementById("button-connect").innerText = "Connect Arconnect 🦔 "
    document.getElementById("address").innerText = ''
    document.getElementById("button-connect").setAttribute("onClick", "linkArconnect()")
    status = false;

}

async function create() {
	if (!status) {
		alert("Please login using Arconnect web extension")
		return
	}
    const name = document.getElementById("tribus-name").value
    const id = document.getElementById("tribus-id").value
    const description = document.getElementById("description").value
    const entry = Number(document.getElementById("membership-entry").value)
    const visibility = Number(document.getElementById("post-visibility").value)

    if (! Number.isInteger(entry) || ! Number.isInteger(visibility)) {
    	alert("entry and post visibility must be integers")
    	return
    }

    if (id.length !== 43 || typeof id !== "string") {
    	alert("invalid id")
    	return
    }

    if (typeof description !== "string" || description.length > 200) {
    	alert("description must be String type and less than 200 characters")
    	return
    }

    if (typeof name !== "string" || name.length < 3 || name.length > 25) {
    	alert("Tribus Name must be string type between 3 and 25 characters")
    	return
    }



    const tx = await arweave.createTransaction({
        data: `Tribus creation attempt for ${id}`
    })

    tx.addTag("Content-Type", "text/plain")
    tx.addTag("App-Name", "SmartWeaveAction")
    tx.addTag("App-Version", "0.3.0")
    tx.addTag("Contract-Src", "R-QcFFg0v-V9Rj85zSXiA6vzsKbynDNCes7Ttz-PXLw")
    tx.addTag("input", `{"function": "createTribus", "name": "${name}", "id": "${id}", "membership": ${entry}, "visibility": ${visibility}, "description": ${description}}`)

    await window.arweaveWallet.sign(tx);

    console.log(tx)
}
