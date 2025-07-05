import { Client, Databases, ID, Query } from 'appwrite';

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject(PROJECT_ID);

const database = new Databases(client);

export  const updateSearchCount = async (searchTerm, movie = null) => {
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal('searchTerm', searchTerm),
    ]);

    if (result.documents.length > 0) {
      const doc = result.documents[0];
      await database.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
        count: doc.count + 1,
      });
    } else {
      // Only add movie data if available
      const docData = {
        searchTerm,
        count: 1,
      };
      if (movie) {
        docData.movie_id = movie.id;
        docData.poster_url = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
      }

      await database.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(),
        docData
      );
    }
  } catch (error) {
    console.error('Appwrite DB error:', error);
  }
};
export const getTrendingMovies = async () => {
 try {
  const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
    Query.limit(5),
    Query.orderDesc("count")
  ])

  return result.documents;
 } catch (error) {
  console.error(error);
 }
}

export default updateSearchCount;