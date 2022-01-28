<script>
	import { onMount } from 'svelte';
    export let caption;
    export let result
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
          showImage = false; 
    }
    function delete_image(){
        showImage = false; 
        result = '';
        input.value='';
    }
  </script>
  
  <label for="picture_file">{caption}</label>
  {#if !showImage}
    <input id="picture_file"
        bind:this={input}
        on:change={onChange}
    type="file"
    />
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
  </style>
  