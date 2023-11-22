<script>
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabase";

  let bibleVerses = [];
  let groupedVerses = {};
  let loading = true;
  let error = "";
  let searchQuery = "";

  async function fetchBibleVerses() {
    const { data, error: fetchError } = await supabase
      .from("kjvbible")
      .select("*");

    if (fetchError) {
      console.error("Error fetching Bible verses:", fetchError);
      error = fetchError.message;
    } else {
      bibleVerses = data;
      processVerses(); // Process verses immediately after fetching
    }
    loading = false;
  }

  function highlightText(text, query) {
    if (!query) return text;
    const regex = new RegExp(query, "gi");
    const result = text.replace(
      regex,
      (match) => `<span class="highlight">${match}</span>`,
    );
    console.log(result); // Debugging: Check the output
    return result;
  }

  function processVerses() {
    groupedVerses = {};
    // No need to convert to lowercase here
    for (const verse of bibleVerses) {
      const { book, chapter, verse: verseNumber, text } = verse;
      const verseContent = `${book} ${chapter}:${verseNumber} ${text}`;

      if (
        !searchQuery ||
        verseContent.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        const displayText = highlightText(text, searchQuery);

        if (!groupedVerses[book]) groupedVerses[book] = {};
        if (!groupedVerses[book][chapter]) groupedVerses[book][chapter] = [];
        groupedVerses[book][chapter].push({ ...verse, displayText });

        // Debugging
        console.log(
          `Processed verse: ${verseContent}, Display: ${displayText}`,
        );
      }
    }
  }

  onMount(fetchBibleVerses);

  // Reactive statement to process verses whenever bibleVerses updates or searchQuery changes
  // Reactive statement to reprocess verses whenever search query changes
  $: searchQuery, processVerses();
</script>

<div class="container mx-auto p-4">
  <input
    type="text"
    bind:value={searchQuery}
    placeholder="Search Bible verses"
    class="search-input"
  />
  {#if loading}
    <p>Loading...</p>
  {:else if error}
    <p class="error">{error}</p>
  {:else}
    {#each Object.entries(groupedVerses) as [book, chapters]}
      <h2 class="text-2xl font-bold">{book}</h2>
      {#each Object.entries(chapters) as [chapter, verses]}
        <h3 class="text-xl font-bold">Chapter {chapter}</h3>
        {#each verses as verse}
          <div class="verse">
            <p>
              <b>{verse.chapter}:{verse.verse}</b> - {@html verse.displayText}
            </p>
          </div>
        {/each}
      {/each}
    {/each}
  {/if}
</div>

<style>
  :global(.highlight) {
    background-color: green;
    padding: 2px;
    font-weight: bolder;
    border: 1px solid greenyellow;
    font-size: 1.1em;
    color: white;
  }

  .search-input {
    width: 100%;
    padding: 8px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  .verse {
    margin-bottom: 10px;
  }
  .error {
    color: red;
  }
  .highlight {
    background-color: yellow;
  }
</style>
