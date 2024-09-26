console.log("IT’S ALIVE!");

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

document.body.insertAdjacentHTML(
  "afterbegin",
  `
	<label class="color-scheme">
		Theme:
		<select>
      <option value="light-dark">Automatic</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
		</select>
	</label>`
);

const select = document.querySelector(".color-scheme select");

select.addEventListener("input", function (event) {
  setColorScheme(event.target.value);
});

document.addEventListener("DOMContentLoaded", function () {
  const storedValue = localStorage.getItem("colorScheme");
  if (storedValue) {
    setColorScheme(storedValue);
  }
});

function setColorScheme(theme) {
  document.documentElement.style.setProperty("color-scheme", theme);
  localStorage.setItem("colorScheme", theme);
  select.value = theme;
}
