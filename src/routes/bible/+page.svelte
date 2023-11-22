<script>
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabase";
  import { debounce } from "lodash";

  let bibleVerses = [];
  let groupedVerses = {};
  let loading = true;
  let error = "";
  let searchQuery = "";

  let matchCount = {
    total: 0,
    books: {},
    chapters: {},
  };

  async function fetchBibleVerses() {
    let index = 0;
    const limit = 1000;
    let hasMore = true;

    bibleVerses = [];

    while (hasMore) {
      const { data, error: fetchError } = await supabase
        .from("kjvbible")
        .select("*")
        .range(index, index + limit - 1);

      if (fetchError) {
        console.error("Error fetching Bible verses:", fetchError);
        error = fetchError.message;
        break;
      }

      if (data.length < limit) {
        hasMore = false;
      }

      bibleVerses = [...bibleVerses, ...data];
      index += limit;
    }

    processVerses(); // Call this function once all data is loaded
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
    matchCount = { total: 0, books: {}, chapters: {} };

    for (const verse of bibleVerses) {
      const { book, chapter, verse: verseNumber, text } = verse;
      const verseContent = `${book} ${chapter}:${verseNumber} ${text}`;

      if (
        !searchQuery ||
        verseContent.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        const displayText = highlightText(text, searchQuery);

        if (!groupedVerses[book]) {
          groupedVerses[book] = {};
          matchCount.books[book] = 0;
        }
        if (!groupedVerses[book][chapter]) {
          groupedVerses[book][chapter] = [];
          matchCount.chapters[`${book}-${chapter}`] = 0;
        }

        groupedVerses[book][chapter].push({ ...verse, displayText });
        matchCount.total++;
        matchCount.books[book]++;
        matchCount.chapters[`${book}-${chapter}`]++;
      }
    }
  }

  onMount(fetchBibleVerses);

  // Debounced processVerses function
  const debouncedProcessVerses = debounce(() => {
    if (bibleVerses.length > 0) {
      processVerses();
    }
  }, 200); // 300 ms delay

  // Reactive statement to call debounced function on search query change
  $: searchQuery, debouncedProcessVerses();
</script>

<div class="">
  <h1 class="text-4xl font-bold text-center mt-4">Bible Search</h1>
</div>
<div class="container mx-auto p-4">
  <input
    type="text"
    bind:value={searchQuery}
    placeholder="Search Bible verses"
    class="search-input"
  />
  {#if loading}
    <div class="flex flex-col h-full mt-52 justify-center items-center">
      <p class="my-2 text-4xl text-center font-extrabold">Loading...</p>
      <p class="my-2 text-2xl text-justify font-bold">
        We've waited patiently this long for the Rapture...what's a few more
        seconds for God's word to load :)
      </p>
      <p class="my-2 text-2xl text-justify font-bold">
        WE NEED TO BE WITH OUR LORD!!!!!
      </p>
      <p class="my-2 text-2xl text-justify font-bold">
        PRAISE GOD...LET'S GOOOOOO!!!!!
      </p>
    </div>
  {:else if error}
    <p class="error">{error}</p>
  {:else}
    <p class="my-2">
      Total Matches: <span class="text-lg ml-2 text-green-800 font-bold"
        >({matchCount.total})</span
      >
    </p>
    {#each Object.entries(groupedVerses) as [book, chapters]}
      <h2 class="flex items-center text-2xl font-bold">
        {book}
        <span class="text-lg ml-2 text-green-800"
          >({matchCount.books[book]})</span
        >
      </h2>
      {#each Object.entries(chapters) as [chapter, verses]}
        <h3 class="flex items-center text-xl font-bold">
          Chapter {chapter}
          <span class="text-sm ml-2 text-green-800"
            >({matchCount.chapters[`${book}-${chapter}`]})</span
          >
        </h3>
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
