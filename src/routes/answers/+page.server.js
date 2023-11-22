async function fetchAllBibleVerses() {
    console.log("Fetching all Bible verses");

    // First, ensure the user is authenticated
    const user = supabase.auth.user();
    if (!user) {
        console.error("User is not authenticated");
        return [];
    }

    // Proceed with fetching data
    const { data: kjvbible, error } = await supabase
        .from('kjvbible')
        .select('*');

    if (error) {
        console.error("Error fetching all Bible verses:", error);
    } else if (kjvbible) {
        console.log("Fetched Bible verses:", kjvbible);
    } else {
        console.log("No data returned from the query");
    }
    return kjvbible;
}
