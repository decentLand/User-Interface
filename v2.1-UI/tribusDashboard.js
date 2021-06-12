const arweave = Arweave.init({
	host: "arweave.net",
	protocol: "https"
})

const readContract = smartweave.readContract
const tribusID = window.location.hash.substring(1);

let TRIBUSES_STATE;
//tribus metrics
const tribusName = document.getElementById("tribusName");
const tribusBio = document.getElementById("bio");
const tribusMembership = document.getElementById("tribusMembership");
const tribusPostVisibility = document.getElementById("tribusPostVisibility");
const tribusLastUpdate = document.getElementById("tribusLastUpdate");
// PSC metrics
const pscLogo = document.getElementById("logo");
const pscVotes = document.getElementById("votes");
const pscTicker = document.getElementById("ticker");
const pscCxyz = document.getElementById("cxyz");
const pscVerto = document.getElementById("trade-on-verto");
const pscHolders = document.getElementById("holders");


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
	const psc = await get_psc_data(tribusID);
	
	await parse_tribus_name(TRIBUSES_STATE, tribusID)
	await parse_tribus_idendity(TRIBUSES_STATE, tribusID)
	await parse_psc_data(psc)

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

async function parse_psc_data(pscObject) {

	const {logo, ticker, votesCount} = pscObject;
	// links
	const gateway = "https://arweave.net"
	const verto = "https://verto.exchange/token?id="
	const communityXYZ = "https://community.xyz/#"
	const viewblockHolders = "https://viewblock.io/arweave/address/"

	pscLogo.innerHTML = `<img style="max-height: 100px; min-height: 100px" src="${gateway}/${logo}">`
	pscVotes.innerHTML = `Votes Count: ${votesCount}`
	pscTicker.innerHTML = `PSC Ticker: $${ticker}`
	pscVerto.innerHTML = `<button onclick="window.location.href='${verto}${tribusID}'">Trade $${ticker} On Verto</button>`
	pscCxyz.innerHTML = `<button onclick="window.location.href='${communityXYZ}${tribusID}'">CommunityXYZ</button>`
	pscHolders.innerHTML = `<button onclick="window.location.href='${viewblockHolders}${tribusID}?tab=holders'">Holders List</button>`


}

async function get_psc_data(tribusID) {
	const pscState = await readContract(arweave, tribusID);

	const logo = pscState["settings"][5][1]
	const ticker = pscState["ticker"]
	const votesCount = pscState["votes"].length

	return {
		logo,
		ticker,
		votesCount
	}
}


get_tribus(tribusID)
setInterval(arweaveNetwork, 3000)
