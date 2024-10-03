<svelte:head>
	<title>Contact Me</title>
</svelte:head>
<main>
    <div class="columns card">
      <div>
        <img src="images/mail.png" />
      </div>
      <div>
        <h1>Contact</h1>
        <p>Feel free to send me a message using the form below!</p>
        <form
          action="mailto:jadedeo@gmail.com"
          method="post"
          enctype="text/plain"
        >
          <div class="form-element">
            <label for="email">Email</label>
            <input id="email" type="email" />
          </div>
          <div class="form-element">
            <label for="subject">Subject</label>
            <input id="subject" />
          </div>
          <div class="form-element">
            <label for="message">Message</label>
            <textarea id="message" rows="5"></textarea>
          </div>
          <button>Submit</button>
        </form>
      </div>
    </div>
  </main>

<style>
  /* CONTACT */
  form {
    margin: 30px 0 20px 0;
    gap: 15px;
    display: grid;
  }

  input,
  textarea {
    border-radius: 5px;
    border: 0;
    background-color: color-mix(in oklch, var(--page-background), canvas 55%);
    padding: 5px 15px;
  }

  input {
    height: 30px;
  }

  .form-element {
    display: grid;
    grid-template-columns: 90px auto;
    grid-column: 1 / -1;
  }

  .form-element label {
    font-weight: bold;
  }
</style>