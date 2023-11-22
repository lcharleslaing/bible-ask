<script>
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabase";
  let userProfiles = [];
  let username = "";
  let imageBase64 = "";
  let loading = false;
  let errorMessage = "";
  let userId = null; // Variable to store the authenticated user's ID

  onMount(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      userId = user.id;
      fetchUserProfiles();
    } else {
      console.error("User is not authenticated.");
      errorMessage = "User is not authenticated.";
    }
  });

  async function fetchUserProfiles() {
    loading = true;
    let { data: profiles, error } = await supabase
      .from("user_profiles")
      .select("*");
    if (error) {
      console.error("Error fetching profiles:", error);
      errorMessage = error.message;
    } else {
      userProfiles = profiles;
    }
    loading = false;
  }

  async function handleSubmit() {
    if (!userId) {
      errorMessage = "User is not authenticated.";
      return;
    }

    loading = true;
    const { data, error } = await supabase
      .from("user_profiles")
      .upsert({ user_id: userId, username, image: imageBase64 });

    if (error) {
      console.error("Error submitting profile:", error);
      errorMessage = error.message;
    } else {
      fetchUserProfiles(); // Refresh the list
    }
    loading = false;
  }

  function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        imageBase64 = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }
</script>

<div class="container mx-auto p-4">
  {#if loading}
    <p class="text-center text-gray-600">Loading...</p>
  {:else}
    <div class="max-w-md mx-auto bg-white p-6 rounded shadow">
      <form on:submit|preventDefault={handleSubmit} class="space-y-4">
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700"
            >Username</label
          >
          <input
            type="text"
            id="username"
            bind:value={username}
            placeholder="@Clapper Username"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label for="image" class="block text-sm font-medium text-gray-700"
            >Profile Image</label
          >
          <input
            type="file"
            id="image"
            on:change={handleImageUpload}
            class="mt-1 block w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 cursor-pointer focus:outline-none"
          />
        </div>

        <button
          type="submit"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >Save Profile</button
        >
      </form>
    </div>

    {#if errorMessage}
      <p class="error mt-4 text-center text-red-600">{errorMessage}</p>
    {/if}

    <div class="flex justify-center">
      <div class="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each userProfiles as profile}
          <div class="profile bg-white p-4 rounded-lg shadow">
            <p class="text-lg font-semibold">{profile.username}</p>
            <img
              width="300px"
              src={profile.image}
              alt="Profile"
              class="mt-2 rounded"
            />
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .profile {
    /* Add styles for profile display */
  }
  .error {
    color: red;
  }
</style>
