<style>
  .super{
    font-size: 1.1em;
  }
</style>
<script>
  import {values} from './store.js';

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


	const { degrees, PDFDocument, rgb, StandardFonts } = PDFLib
  function modifyPdfNow(){
    $values.forEach(function(item, index, array) {
      if(item.type == 4){
          item.value = today.format("HH:MM");
        }
      else if(item.type == 5){
          item.value = today.format("yyyy-mm-dd");
        }
      });
    values.set($values);
    modifyPdf();
  }
  function modifyPdfTomorrow(){
    $values.forEach(function(item, index, array) {
        if(item.type == 5){
          item.value = tomorrow.format("yyyy-mm-dd");
        }
      });
    values.set($values);
    modifyPdf();
  }
    async function modifyPdf() {
      // Fetch an existing PDF document
      const url = './assets/Eigenbescheinigung.pdf'
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
      $values.forEach(function(item, index, array) {
        let drawValue = item.value;
        if(item.type == 5){
          drawValue = new Date(item.value).format("dd.mm.yyyy");
        }
        if(item.type == 6){
          if(item.value){
            drawValue='x';
          }else{
            drawValue='';
          }
        }
        firstPage.drawText(drawValue, {
          x: item.position[0],
          y: height - item.position[1],
          size: 12,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        })
      });

      // Serialize the PDFDocument to bytes (a Uint8Array)
      const pdfBytes = await pdfDoc.save()
	  
			// Trigger the browser to download the PDF document
			download(pdfBytes, "eigenbescheinigung.pdf", "application/pdf");
    }
</script>

<section>
  <form on:submit|preventDefault={modifyPdf}>
    <header><h2 class="super">Einverständniserklärung</h2></header>
    {#each $values as { name, caption, value, type }, i}
      {#if type == 1}
      <label for="{name}">{caption}</label>
        <input id="{name}" type="text" bind:value="{value}" />
      {:else if type == 2}
        <label for="{name}">{caption}</label>
        <textarea id="{name}" bind:value></textarea>
      {:else if type == 3}
      <label for="{name}">{caption}</label>
        <input type="file" bind:value="{value}" />
      {:else if type == 6}
        <label for="{name}">{caption}</label>
        <input id="{name}" type="checkbox" bind:checked="{value}" />
      {/if}
    {/each}
  </form>
</section>
<section>
  <form on:submit|preventDefault={modifyPdfNow}>
    <button>Erstellen jetzt</button>
  </form>
  </section>
  <section>
  <form on:submit|preventDefault={modifyPdfTomorrow}>
    {#each $values as { name, caption, value, type }, i}
      {#if type == 4}
        <label for="{name}">{caption}</label>
        <input id="{name}" type="time" bind:value="{value}" />
      {/if}
    {/each}
    <button>Erstellen morgen</button>
  </form>
</section>
<section>
  <form on:submit|preventDefault={modifyPdf}>
    {#each $values as { name, caption, value, type }, i}
      {#if type == 4}
        <label for="{name}">{caption}</label>
        <input id="{name}" type="time" bind:value="{value}" />
      {:else if type == 5}
          <label for="{name}">{caption}</label> <input id="{name}" format="dd.mm.YYYY" type="date" bind:value="{value}" />
      {/if}
    {/each}
    <button>Erstellen</button>
  </form>
</section>
