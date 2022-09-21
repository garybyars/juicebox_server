const { client, 
  createUser,
  updateUser, 
  getAllUsers,
  getUserById,
  createPost,
  updatePost,
  getAllPosts,
  getAllTags,
  createTags,
  addTagsToPost,
  getPostsByTagName,
} = require('./index');

const dropTables = async() => {
  try {
    console.log('...starting to drop tables...');

    await client.query(`
      DROP TABLE IF EXISTS post_tags;
      DROP TABLE IF EXISTS tags;
      DROP TABLE IF EXISTS posts;
      DROP TABLE IF EXISTS users; 
    `)

    console.log('...finished dropping tables...');
  } catch(err) {
    console.log('...error dropping tables...')
    throw err;
  }
}

const createTables = async() => {
  try {
    console.log('...starting to build tables...')

    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        active BOOLEAN DEFAULT true
      );

      CREATE TABLE posts (
        id SERIAL PRIMARY KEY,
        "authorId" INTEGER REFERENCES users(id) NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        active BOOLEAN DEFAULT true 
      );

      CREATE TABLE tags (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL
      );

      CREATE TABLE post_tags (
        "postId" INTEGER REFERENCES posts(id),
        "tagId" INTEGER REFERENCES tags(id), 
        UNIQUE ("postId", "tagId")
      );  
    `);
  
  console.log('...finished building tables...');
  } catch(err) {
    console.log('...error building tables...');
    throw err;
  }
}

const createInitialUsers = async() => {
  try {
    console.log('...starting to create users...')

    await createUser({ username: 'albert', password: 'bertie99', name: 'Al Bert', location: 'Sidney, Australia' });
    await createUser({ username: 'sandra', password: '2sandy4me', name: 'Just Sandy', location: "Ain't Tellin'"  });
    await createUser({ username: 'glamgal', password: 'soglam', name: 'Joshua', location: 'Upper East Side'  });

    console.log('...finished creating users...')
  } catch(err) {
    console.log('...error creating users...')
    throw err
  }
}

const createInitialPosts = async() => {
  try {
    const [albert, sandra, glamgal] = await getAllUsers();  

    console.log('...starting to create posts...');
    await createPost({
      authorId: albert.id,
      title: "First Post",
      content: "This is my first post. I hope I enjoy writing blogs as much as I enjoy reading them.",
      tags: ["#happy", "#youcandoanything"]
    });

    await createPost({
      authorId: sandra.id,
      title: "How does this work?",
      content: "Seriously, does this even do anything?",
      tags: ["#happy", "#worst-day-ever"]
    });

    await createPost({
      authorId: glamgal.id,
      title: "Lving The Glam Life",
      content: "Do you even? I swear that half of you are posing.",
      tags: ["#happy", "#youcandoanything", "#canmandoeverything"]
    });

    console.log('...finished creating posts...');
  } catch(err) {
    console.log('...error creating posts...');
    throw err;
  }
}

const createInitialTags = async() => {
  try {
    console.log('...starting to create tags...');

    const [happy, sad, inspo, catman] = await createTags([
      '#happy',
      '#worst-day-ever',
      '#youcandoanything',
      '#catmandoeverything'
    ]);
    
    const [postOne, postTwo, postThree] = await getAllPosts();
    
    await addTagsToPost(postOne.id, [happy, inspo]);
    await addTagsToPost(postTwo.id, [sad]);
    await addTagsToPost(postThree.id, [happy, catman, inspo]);
  
    console.log('...finished creating tags...')
  } catch (err) {
    console.log('...error creating tags...')
    throw err;
  }
}

const rebuildDB = async() => {
  try {
    client.connect();

    await dropTables();
    await createTables();
    await createInitialUsers();
    await createInitialPosts();
    await createInitialTags();
  } catch(err) {
    console.log('...error rebuilding DB...')
    throw err;
  }
}

const testDB = async() => {
  try {
    console.log('...starting to test database...');

    console.log('...calling getAllUsers...')
    const users = await getAllUsers();
    console.log('...result:', users);

    console.log('...calling updateUser on users[0]...' )
    const updateUserResult = await updateUser(users[0].id, {
      name: 'Newname Sogood',
      location: 'Lesterville, KY'
    });
    console.log('...result:', updateUserResult);

    console.log('...calling getAllPosts...')
    const posts = await getAllPosts();
    console.log('...result:', posts);

    console.log('...calling updatePost on posts[0]...')
    const updatePostResult = await updatePost(posts[0].id, {
      title: 'New Title',
      content: 'Updated Content'
    });
    console.log('...result:', updatePostResult);

    console.log('...calling updatePost on posts[1], only updating tags...');
    const updatePostTagsResult = await updatePost(posts[1].id, {
      tags: ["#youcandoanything", "#redfish", "#bluefish"]
    });
    console.log('...result:', updatePostTagsResult);

    console.log('...calling getUserById with 1');
    const albert = await getUserById(1);
    console.log('...result:', albert);

    console.log("...calling getAllTags");
    const allTags = await getAllTags();
    console.log("...result:", allTags);

    console.log('...calling getPostsByTagName with #happy...');
    const postsWithHappy = await getPostsByTagName("#happy");
    console.log('...result:', postsWithHappy);

    console.log('...finished testing database...');
  } catch(err) {
    console.log('...error testing database...');
    throw err;
  }
}

rebuildDB()
  .then(testDB)
  .catch(console.error)
  .finally(() => client.end());