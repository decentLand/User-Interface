const arweave = Arweave.init({
	host: "arweave.net",
	protocol: "https"
})

let isLogged = false;

async function linkArconnect() {
    if (! await window.arweaveWallet) {
        swal({title: "Arconnect Not Found", text: "Please download Arconnect from arconnect.io", icon: "error"})
        return
    }
	
    await window.arweaveWallet.connect(["ACCESS_ADDRESS", "ACCESS_ALL_ADDRESSES", "SIGN_TRANSACTION"]);
    const address = await window.arweaveWallet.getActiveAddress();
    document.getElementById("button-connect").innerText = "logout 🚪"
    document.getElementById("button-connect").setAttribute("onClick", "logout()")
    document.getElementById("address").innerText = `active wallet: ${address}`
    isLogged = true;
}

async function logout() {
    await window.arweaveWallet.disconnect();
    document.getElementById("button-connect").innerText = "Connect Arconnect 🦔 "
    document.getElementById("address").innerText = ''
    document.getElementById("button-connect").setAttribute("onClick", "linkArconnect()")
    isLogged = false;

}

async function create() {
	if (!isLogged) {
		swal({title: "Arconnect Not Found", text: "Please download Arconnect from arconnect.io", icon: "error"})
		return
	}
    const name = document.getElementById("tribus-name").value
    const id = document.getElementById("tribus-id").value
    const description = document.getElementById("description").value
    const entry = Number(document.getElementById("membership-entry").value)
    const visibility = Number(document.getElementById("post-visibility").value)

    if (! Number.isInteger(entry) || ! Number.isInteger(visibility)) {
    	swal({title: "Input Error", text: "Entry and post visibility must be integers", icon: "error"})
    	return
    }

    if (id.length !== 43 || typeof id !== "string") {
    	swal({title: "Input Error", text: "Invalid PSC TXID", icon: "error"})
    	return
    }

    if (typeof description !== "string" || description.length > 200) {
    	swal({title: "Input Error", text: "Description must be String type and less than 200 characters", icon: "error"})
    	return
    }

    if (typeof name !== "string" || name.length < 3 || name.length > 25) {
    	swal({title: "Input Error", text: "Tribus Name must be string type between 3 and 25 characters", icon: "error"})
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

    await arweave.transactions.sign(tx)
    swal({title: "Tribus Creation", text: `Creation TX Sent Successfully: ${tx.id}`, icon: "success"})

    console.log(tx)
}
