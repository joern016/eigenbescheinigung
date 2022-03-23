<style>
  section {
    margin-top: 10px;
  }
</style>
<script>
  import {values, remember} from './store.js';
	import Pic from './Pic.svelte';
  import download from 'downloadjs';


  let types = [
    {'id': 1, 'value': 'singleline'},
    {'id': 2, 'value': 'multline'},
    {'id': 3, 'value': 'picture'},  
    {'id': 4, 'value': 'autotime'},
    {'id': 5, 'value': 'autodate'},
    {'id': 6, 'value': 'checkbox'},
  ]

  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  

	const { PDFDocument, rgb, StandardFonts } = PDFLib
  function modifyPdfNow(share = false){
    $values.forEach(function(item, index, array) {
      if(item.type == 4){
          item.value = today.format("HH:MM");
        }
      else if(item.type == 5){
          item.value = today.format("yyyy-mm-dd");
        }
      });
    values.set($values);
    modifyPdf(share);
  }
  function modifyPdfTomorrow(share = false){
    $values.forEach(function(item, index, array) {
        if(item.type == 5){
          item.value = tomorrow.format("yyyy-mm-dd");
        }
      });
    values.set($values);
    modifyPdf(share);
  }

    async function modifyPdf(share = false) {
      // Fetch an existing PDF document
      const url = './files/Eigenbescheinigung.pdf'
  		const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer())

      // Load a PDFDocument from the existing PDF bytes
      const pdfDoc = await PDFDocument.load(existingPdfBytes)

      // Embed the Helvetica font
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

      // Get the first page of the document
      const pages = pdfDoc.getPages()
      const firstPage = pages[0]

      // Get the width and height of the first page
      const { width, height } = firstPage.getSize()

      // Draw the Strings in the page
      for (let i = 0; i < $values.length; i++) {
        let item = $values[i];
        let drawValue = item.value;
        if(item.type == 5 && drawValue){
          drawValue = new Date(item.value).format("dd.mm.yyyy");
        }
        if(item.type == 6){
          if(item.value){
            drawValue='x';
          }else{
            drawValue='';
          }
        }
        if(item.type == 3 && drawValue){ 
          let image;
          if(drawValue.match('data:image/png.*')){
            image = await pdfDoc.embedPng(drawValue);
          }else{
            image = await pdfDoc.embedJpg(drawValue);
          }
          
          let size = image.scaleToFit(item.width, item.height);
          firstPage.drawImage(image, {
            x: item.position[0],
            y: height - item.position[1],
            width: size.width,
            height: size.height,
          })
        }
        else if (drawValue){
          firstPage.drawText(drawValue, {
            x: item.position[0],
            y: height - item.position[1],
            size: 12,
            font: helveticaFont,
            color: rgb(0, 0, 0),
          })
        }
      };

      // Serialize the PDFDocument to bytes (a Uint8Array)
      const pdfBytes = await pdfDoc.save()
	  
      const pdf = new File([pdfBytes], "eigenbescheinigung.pdf", { type: "application/pdf" });
      const files = [pdf];

      // Share PDF file if supported.
      if (share && navigator.canShare({ files })) {
        await navigator.share({ files });
      }
      else{
			  download(pdfBytes, "eigenbescheinigung.pdf", "application/pdf");
      }

    }

  let checkbox;
  function change_remember(){
    if($remember){
      remember.set(false);
      localStorage.removeItem("EigenbescheinigungValues");
    }else{
      remember.set(true);
      values.set($values);
    }
  }
</script>

<main>
  <section>
    <form on:submit|preventDefault={modifyPdf}>
      <header><h2>Eigenbescheinigung Kita</h2></header>
      <input id="check_remember" type="checkbox" on:click="{change_remember}" checked="{$remember}" bind:this="{checkbox}" />
      <label for="check_remember">Daten lokal speichern</label>
      <br/>
      {#each $values as { name, caption, value, type }, i}
        {#if type == 1}
        <label for="{name}">{caption}</label>
          <input id="{name}" type="text" bind:value="{value}" />
        {:else if type == 2}
          <label for="{name}">{caption}</label>
          <textarea id="{name}" bind:value></textarea>
        {:else if type == 3}
          <Pic caption="{caption}" bind:result="{value}"></Pic>
        {:else if type == 6}
          <br />
          <input id="{name}" type="checkbox" bind:checked="{value}" />
          <label for="{name}">{caption}</label>
        {/if}
      {/each}
    </form>
  </section>
  <section>
    <form on:submit|preventDefault={() => {modifyPdfNow(false)}}>
      <button alt="Jetzt Herunterladen"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-download" viewBox="0 0 16 16">
        <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
        <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
      </svg></button>
      <button type="button" alt="Jetzt Teilen" on:click="{() => {modifyPdfNow(true)}}"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-share" viewBox="0 0 16 16">
        <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5zm-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
      </svg></button>
    </form>
    </section>
    <section>
    <form on:submit|preventDefault={() => {modifyPdfTomorrow(false)}}>
      {#each $values as { name, caption, value, type }, i}
        {#if type == 4}
          <label for="{name}">{caption}</label>
          <input id="{name}" type="time" bind:value="{value}" />
        {/if}
      {/each}
      <button alt="Morgen herunterladen"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-download" viewBox="0 0 16 16">
        <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
        <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
      </svg></button>
      <button type="button" alt="Morgen Teilen" on:click="{() => {modifyPdfTomorrow(true)}}"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-share" viewBox="0 0 16 16">
        <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5zm-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
      </svg></button>
    </form>
  </section>
  <section>
    <form on:submit|preventDefault={() => {modifyPdf(false)}}>
      {#each $values as { name, caption, value, type }, i}
        {#if type == 4}
          <label for="{name}">{caption}</label>
          <input id="{name}" type="time" bind:value="{value}" />
        {:else if type == 5}
            <label for="{name}">{caption}</label> <input id="{name}" format="dd.mm.YYYY" type="date" bind:value="{value}" />
        {/if}
      {/each}
      <button alt="Herunterladen"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-download" viewBox="0 0 16 16">
        <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
        <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
      </svg></button>
      <button type="button" alt="Teilen" on:click="{() => {modifyPdf(true)}}"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-share" viewBox="0 0 16 16">
        <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5zm-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
      </svg></button>
    </form>
  </section>
</main>
<footer>
  Es werden keine Daten auf den Server übertragen. Alles wird lokal generiert und gespeichert.<br />
  Erstellt mit <a target="_blank" href="https://www.svelte.dev">Svelte</a>, <a target="_blank" href="https://pdf-lib.js.org/">PDF-Lib</a> und <a target="_blank" href="https://andybrewer.github.io/mvp/">mvp.css</a>
</footer>
