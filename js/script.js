const books = [];
const createdBookItems = [];
const RENDER_EVENT = "render-book";

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isCompleted) {
  return {
    id,
    title,
    author,
    year,
    isCompleted,
  };
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function makeBook(bookObject) {
  const { id, title, author, year, isCompleted } = bookObject;

  const container = document.createElement("div");
  const wrapbutton = document.createElement("div");
  const textContainer = document.createElement("div");
  const textTitle = document.createElement("h3");
  const textAuthor = document.createElement("p");
  const textYear = document.createElement("p");

  container.classList.add("book-item");
  container.append(textContainer);
  container.append(wrapbutton);
  container.setAttribute("id", `book-${id}`);

  wrapbutton.classList.add("wrap-button");

  textContainer.classList.add("inner");
  textContainer.append(textTitle, textAuthor, textYear);

  textTitle.innerText = title;
  textAuthor.innerText = author;
  textYear.innerText = year;

  if (isCompleted) {
    const undoButton = document.createElement("button");
    undoButton.classList.add("undo-button");
    undoButton.addEventListener("click", function () {
      undoBookFormCompleted(id);
    });

    const trashButton = document.createElement("button");
    trashButton.classList.add("trash-button");
    trashButton.addEventListener("click", function () {
      const isConfirmed = confirm(
        "Apakah Anda yakin ingin menghapus buku ini?"
      );

      if (isConfirmed) {
        const bookId = this.parentElement.parentElement.id.replace("book-", "");
        removeBookFormCompleted(bookId);
        removeBookFormCompleted(id);
      }
      return;
    });

    wrapbutton.append(undoButton, trashButton);
  } else {
    const checkButton = document.createElement("button");
    checkButton.classList.add("check-button");
    checkButton.addEventListener("click", function () {
      addBookToCompleted(id);
    });

    wrapbutton.append(checkButton);
  }

  createdBookItems.push(container);
  return container;
}

function addBook() {
  const textBook = document.getElementById("title").value;
  const author = document.getElementById("author").value;
  const year = document.getElementById("year").value;

  const existingBook = books.find(
    (book) =>
      book.title === textBook && book.author === author && book.year === year
  );
  if (existingBook) {
    alert("Buku sudah ada dalam daftar!");
    return;
  }

  const generatedID = generateId();
  const bookObject = generateBookObject(
    generatedID,
    textBook,
    author,
    year,
    false
  );
  books.push(bookObject);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}
function addBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;

  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeBookFormCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoBookFormCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("form-list");

  submitForm.addEventListener("submit", function () {
    addBook();

    if (submitForm) {
      inputElement.value = submitForm;
    }
    filterItems(submitForm);
  });
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedBOOKList = document.getElementById("reading");
  const listCompleted = document.getElementById("finished-reading");

  uncompletedBOOKList.innerHTML = "";
  listCompleted.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (bookItem.isCompleted) {
      listCompleted.append(bookElement);
    } else {
      uncompletedBOOKList.append(bookElement);
    }
  }
});

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOK_APPS";

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

const inputElement = document.getElementById("textInput");
const itemsToHide = createdBookItems;

inputElement.addEventListener("keyup", function (event) {
  const inputValue = event.target.value.toLowerCase();
  filterItems(inputValue);
});

function filterItems(inputValue) {
  itemsToHide.forEach((item) => {
    const itemText = item.textContent.toLowerCase();
    if (itemText.includes(inputValue)) {
      item.style.display = "flex";
    } else {
      item.style.display = "none";
    }
  });
}
