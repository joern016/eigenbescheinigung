<script>
	import { onMount } from 'svelte';
    export let caption;
    export let result
    let error_text = "";
    let input;
    let container;
    let image;
    let placeholder;
    let showImage = (result ? true : false);

    function getBase64Image(img) {
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        var dataURL = canvas.toDataURL("image/png");

        return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
    }
    function onChange() {
      const file = input.files[0];
      error_text = "";
      if (!file.type.match(".*(png|jpg|jpeg).*")){
        error_text="Dateityp muss png, jpg oder jpeg sein."
      }
      else{
        if (file) {
                showImage = true;
    
          const reader = new FileReader();
          reader.addEventListener("load", function () {
            image.setAttribute("src", reader.result);
            result = reader.result;
          });
          reader.readAsDataURL(file);
                
                return;
        } 
      }
          showImage = false; 
    }
    function delete_image(){
        showImage = false; 
        result = '';
        if(input){
          input.value='';
        }
    }
  </script>
  
  <label for="picture_file">{caption} (nur png oder jpg)</label>
  {#if !showImage}
    <input id="picture_file"
        bind:this={input}
        on:change={onChange}
    type="file"
    />
    {#if error_text != ""}
      <article>
        <aside class="error"><p>{error_text}</p></aside>
      </article>
    {/if}
  {:else}
    <button on:click|preventDefault={() => delete_image()}>Bild entfernen</button>
  {/if}
  <div bind:this={container}>
      {#if showImage}
          <img bind:this={image} src="{result}" alt="Preview" />
      {:else}
          <span bind:this={placeholder}></span>
      {/if}
  </div>
  
  <style>
      div {
      width: 300px;
      min-height: 100px;
      border: 2px solid #ddd;
      margin-top: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      color: #ccc;
    }
    img {
      width: 100%;
    }
    .error{
      background-color: lightcoral;
    }
  </style>
  