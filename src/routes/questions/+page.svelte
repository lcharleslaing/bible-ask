<script>
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabase";
  let questions = [];
  let questionContent = "";
  let loading = false;
  let errorMessage = "";

  onMount(() => {
    fetchQuestions();
  });

  async function fetchQuestions() {
    loading = true;
    let { data: fetchedQuestions, error } = await supabase
      .from("questions")
      .select("*");
    if (error) {
      console.error("Error fetching questions:", error);
      errorMessage = error.message;
    } else {
      questions = fetchedQuestions;
    }
    loading = false;
  }

  async function submitQuestion() {
    if (questionContent.trim() === "") {
      errorMessage = "Question cannot be empty.";
      return;
    }

    loading = true;
    const { error } = await supabase
      .from("questions")
      .insert([{ content: questionContent }]);

    if (error) {
      console.error("Error submitting question:", error);
      errorMessage = error.message;
    } else {
      fetchQuestions(); // Refresh the list
      questionContent = ""; // Clear the form
    }
    loading = false;
  }
</script>

<div class="container mx-auto p-4">
  {#if loading}
    <p class="text-center text-gray-600">Loading...</p>
  {:else}
    <div class="max-w-md mx-auto bg-white p-6 rounded shadow">
      <form on:submit|preventDefault={submitQuestion} class="space-y-4">
        <div>
          <label for="question" class="block text-sm font-medium text-gray-700"
            >Question</label
          >
          <textarea
            id="question"
            bind:value={questionContent}
            rows="3"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ask your question here"
          ></textarea>
        </div>

        <button type="submit" class="w-full flex justify-center btn btn-primary"
          >Submit Question</button
        >
      </form>
    </div>

    {#if errorMessage}
      <p class="error mt-4 text-center text-red-600">{errorMessage}</p>
    {/if}

    <div class="mt-8">
      <h2 class="text-xl font-semibold mb-4">Questions:</h2>
      {#each questions as question}
        <div class="question bg-white p-4 rounded-lg shadow mb-4">
          <p>{question.content}</p>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .question {
    /* Add styles for question display */
  }
  .error {
    color: red;
  }
</style>
