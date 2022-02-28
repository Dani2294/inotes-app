// CACHING THE DOM
const addBtn = document.getElementById("add");
const notesList = document.getElementById("notes-list");
const rightSide = document.getElementById("rightside");
const searchInput = document.getElementById("search-note");
const sideMenuToggler = document.getElementById("side-menu-toggler");
const sideMenu = document.getElementById("side-menu");

let notes = JSON.parse(localStorage.getItem("notes")) || [];

appHeight();
displayNotesList();

// Add Note
addBtn.addEventListener("click", () => addNote());

function addNote(id, title = "", text = "") {
	sideMenu.classList.remove("side-menu--active");
	searchInput.value = "";
	rightSide.innerHTML = "";

	rightSide.innerHTML = `
		<div class="top-bar top-bar--right">
				<div class="note-title-sec">
					<input type="text" id="note-title-input" class="note-title-input ${
						title ? "hidden" : ""
					}" placeholder="Enter note title here"  maxlength="60">
					<h2 id="note-title" class="note-title ${title ? "" : "hidden"}">${title}</h2>
				</div>

				<!-- Note tools -->
				<div class="note-tools">
					<button id="done" class="btn done">Done</button>
					<button id="edit" class="icon-btn"><i class="fas fa-edit"></i></button>
					<button id="delete" class="icon-btn"><i class="fas fa-trash-alt"></i></button>
				</div>
			</div>

			<!-- Note Textfield -->
			<div class="note-textfield">
				<div id="main" class="main ${text ? "" : "hidden"}"></div>
				<textarea id="textarea" class="${
					text ? "hidden" : ""
				}" placeholder="Write your note with Markdown here..."></textarea>
			</div>
	`;

	const noteTitleInput = document.getElementById("note-title-input");
	const noteTitle = document.getElementById("note-title");
	const doneBtn = document.getElementById("done");
	const editBtn = document.getElementById("edit");
	const deleteBtn = document.getElementById("delete");
	const main = document.getElementById("main");
	const textArea = document.getElementById("textarea");

	setTimeout(() => {
		if (text === "") noteTitleInput.focus();
	}, 500);

	noteTitleInput.value = title;
	textArea.value = text;
	main.innerHTML = marked.parse(text);

	let titleVal = title;
	let textVal = text;

	noteTitleInput.addEventListener("input", (e) => {
		const val = e.target.value;
		noteTitle.innerHTML = val;
		titleVal = val;
	});

	textArea.addEventListener("input", (e) => {
		const term = e.target.value;
		main.innerHTML = marked.parse(term);
		textVal = term;
	});

	editBtn.addEventListener("click", () => {
		console.log(titleVal);
		if (title === "") return;
		main.classList.toggle("hidden");
		textArea.classList.toggle("hidden");

		noteTitle.classList.toggle("hidden");
		noteTitleInput.classList.toggle("hidden");
	});

	deleteBtn.addEventListener("click", () => {
		if (window.confirm("You really want to delete this note ?")) {
			deleteNote(id);
		}
	});

	doneBtn.addEventListener("click", () => {
		if (titleVal === "") {
			alert("Please enter at least a Title");
			return;
		}

		const exist = notes.find((note) => note.id === id);

		if (exist) {
			//console.log("already exist");
			updateNote(id, titleVal, textVal, exist);
			reverseTextField(noteTitleInput, noteTitle, main, textArea);
		} else {
			let newID = ID();

			notes = [
				...notes,
				{
					id: newID,
					title: titleVal,
					text: textVal,
					updated: new Date(),
				},
			];

			id = newID;

			updateLS();

			reverseTextField(noteTitleInput, noteTitle, main, textArea);
		}
		displayNotesList();
		sideMenu.classList.add("side-menu--active");
	});
}

// Update Note
function updateNote(id, titleVal, textVal, exist) {
	notes = JSON.parse(localStorage.getItem("notes"));
	let filteredNotes = notes.map((note) => {
		if (note.id === exist.id) {
			return {
				id: id,
				title: titleVal,
				text: textVal,
				updated: new Date(),
			};
		}
		return note;
	});

	notes = [...filteredNotes];
	searchInput.value = "";
	updateLS();
}

// Delete Note
function deleteNote(id) {
	const filteredNotes = notes.filter((note) => note.id !== id);
	notes = [...filteredNotes];
	displayNotesList();
	updateLS();
	rightSide.innerHTML = "";
	sideMenu.classList.add("side-menu--active");
}

// Display Notes list
function displayNotesList() {
	notesList.innerHTML = "";

	if (notes.length < 1) {
		notesList.innerHTML = `<p class="notes-list__item" >No notes to show...</p>`;
		return;
	}
	/* 
	const updatedNotes = [
		...notes.sort((a, b) => {
			return new Date(a.updated) > new Date(b.updated) ? -1 : 1;
		}),
	];
	console.log(updatedNotes);
     */

	notes.forEach((note) => {
		const MAX_TEXT_LENGTH = 60;
		//const date = note.updated.toLocaleString();
		const li = document.createElement("li");
		li.className = "notes-list__item";

		li.innerHTML = `
            <p class="notes-list__item__title truncate">${note.title}</p>
            <p class="notes-list__item__text">${note.text.substring(
							0,
							MAX_TEXT_LENGTH
						)}${note.text.length > MAX_TEXT_LENGTH ? "..." : ""}</p>
        `;

		li.addEventListener("click", () => {
			addNote(note.id, note.title, note.text);
			noteSelected(li);
		});

		notesList.appendChild(li);
	});
}

// Higligh Selected Note
function noteSelected(li) {
	const liItems = document.querySelectorAll(".notes-list__item");

	liItems.forEach((item) => (item.className = "notes-list__item"));

	li.className = "notes-list__item notes-list__item--active";
}

// Generate random ID
function ID() {
	return "_" + Math.random().toString(36).substring(2, 9);
}

// Show / Hide main or textarea
function reverseTextField(noteTitleInput, noteTitle, main, textArea) {
	main.classList.contains("hidden") ? main.classList.remove("hidden") : null;
	textArea.classList.contains("hidden")
		? null
		: textArea.classList.add("hidden");
	noteTitle.classList.contains("hidden")
		? noteTitle.classList.remove("hidden")
		: null;
	noteTitleInput.classList.contains("hidden")
		? null
		: noteTitleInput.classList.add("hidden");
}

// Search Note
searchInput.addEventListener("input", (e) => {
	notes = JSON.parse(localStorage.getItem("notes"));
	const searchedNotes = notes.filter((note) => {
		return note.title.includes(e.target.value);
	});

	notes = [...searchedNotes];
	displayNotesList();
});

// Toggle Side Menu
sideMenuToggler.addEventListener("click", () => {
	sideMenu.classList.toggle("side-menu--active");
});

// Fixing 100vh issue on mobile
function appHeight() {
	const doc = document.documentElement;
	doc.style.setProperty("--app-height", `${window.innerHeight}px`);
}
window.addEventListener("resize", appHeight);

// Update Locale Storage
function updateLS() {
	localStorage.setItem("notes", JSON.stringify(notes));
}
