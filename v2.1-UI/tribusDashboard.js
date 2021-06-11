const arweave = Arweave.init({
	host: "arweave.net",
	protocol: "https"
})

const readContract = smartweave.readContract
const tribusID = window.location.hash.substring(1);

let TRIBUSES_STATE;

const tribusName = document.getElementById("tribusName");
const tribusBio = document.getElementById("bio");
const tribusMembership = document.getElementById("tribusMembership");
const tribusPostVisibility = document.getElementById("tribusPostVisibility");
const tribusLastUpdate = document.getElementById("tribusLastUpdate");


async function arweaveNetwork() {
    const network = await arweave.network.getInfo()
    document.getElementById("blocks").innerHTML = `Blocks: ${network["blocks"]}`
    document.getElementById("height").innerHTML = `Height: ${network["height"]}`
    document.getElementById("peers").innerHTML = `Peers: ${network["peers"]}`
}


async function get_tribus(tribusID) {
	const id = await readContract(arweave, "Ff0lb80dKvFLfam4aNGgPJiy6zGgRsUpsSFVpNpX5Q0")
	TRIBUSES_STATE = id;

	if (! tribusID) {
		swal({title: "Tribus Not Found", text: "invalid Tribus ID", icon: "error"})
		return
	}

	await parse_tribus_name(TRIBUSES_STATE, tribusID)
	await parse_tribus_idendity(TRIBUSES_STATE, tribusID)

}



async function parse_tribus_name(state, tribusID) {
	tribusName.innerHTML = `Tribus ${state["tribuses"][tribusID]["tribusName"]}`
	tribusBio.innerHTML = `Tribus ${state["tribuses"][tribusID]["description"]}`
}

async function parse_tribus_idendity(state, tribusID) {

	const tribusLogsArray = state["tribuses"][tribusID]["tribusLogs"]
	const lastUpdateTX = tribusLogsArray[tribusLogsArray.length - 1]
	const viewblock = "https://viewblock.io/arweave"

	tribusMembership.innerHTML = `Membership Entry: ${state["tribuses"][tribusID]["membership"]}`
	tribusPostVisibility.innerHTML = `Post Visibility: ${state["tribuses"][tribusID]["visibility"]}`
	tribusLastUpdate.innerHTML = `Last Update ID: <a href="${viewblock}/tx/${lastUpdateTX}">${lastUpdateTX}`
}

get_tribus(tribusID)
setInterval(arweaveNetwork, 3000)
