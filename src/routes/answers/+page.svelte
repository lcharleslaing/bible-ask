<script>
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabase";
  import { debounce } from "lodash-es";
  let searchQuery = "";
  let matchingQuestions = [];
  let selectedQuestionId = null;
  let answerContent = "";
  let loading = false;
  let errorMessage = "";
  let bibleVerses = [];

  async function searchQuestions(query) {
    loading = true;
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .ilike("content", `%${query}%`);

    if (error) {
      errorMessage = error.message;
      console.error("Error searching questions:", error);
    } else {
      matchingQuestions = data;
    }
    loading = false;
  }

  const debouncedSearch = debounce(searchQuestions, 300);

  async function handleQuestionSelect(questionId) {
    selectedQuestionId = questionId;
    // Fetch the answer from OpenAI or your logic to get Bible verses
    // ...
  }

  async function submitAnswer() {
    if (!selectedQuestionId || answerContent.trim() === "") {
      errorMessage = "Please select a question and provide an answer.";
      return;
    }

    // Logic to save the answer with Bible references
    // ...

    answerContent = ""; // Clear the answer field
  }
</script>

<div class="container mx-auto p-4">
  <input
    type="text"
    bind:value={searchQuery}
    on:input={() => debouncedSearch(searchQuery)}
    placeholder="Search questions"
  />
  {#if matchingQuestions.length}
    <ul>
      {#each matchingQuestions as question}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
        <li on:click={() => handleQuestionSelect(question.id)}>
          {question.content}
        </li>
      {/each}
    </ul>
  {/if}

  <!-- Display selected question and input for answer -->
  {#if selectedQuestionId}
    <textarea
      bind:value={answerContent}
      placeholder="Your answer with Bible references"
    ></textarea>
    <button on:click={submitAnswer}>Submit Answer</button>
  {/if}

  {#if errorMessage}
    <p class="error">{errorMessage}</p>
  {/if}
</div>

<style>
  .error {
    color: red;
  }
</style>
