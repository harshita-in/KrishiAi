const CommunityPost = require('../models/communityPost');

// Sample initial threads for instant rich presentation
const INITIAL_CHOPAL_POSTS = [
  {
    _id: 'post-1',
    authorName: 'Ramesh Patel',
    authorRole: 'Farmer',
    title: 'Gehu me 3rd irrigation ke time Urea kitna daalna chahiye?',
    content: 'Mere 3 acre khet me Lokwan gehu ki fasal 55 din ki ho chuki hai. Flag leaf nikal rahi hai. Kya is stage par Urea dena theek rahega?',
    cropTag: 'Wheat (गेहूं)',
    category: 'Pest & Disease',
    upvotes: 14,
    createdAt: new Date(Date.now() - 3600000 * 5),
    replies: [
      {
        authorName: 'Dr. S.K. Sharma',
        authorRole: 'KVK Scientist',
        text: 'Ramesh ji, flag leaf stage par 20-25 kg/acre se zyada Urea mat dalein. Saath me 00:52:34 (Water Soluble Fertilizer) @ 1kg/acre foliar spray karein — daane mote aur chamakdar banenge.',
        createdAt: new Date(Date.now() - 3600000 * 3)
      },
      {
        authorName: 'Vikram Gurjar',
        authorRole: 'Farmer',
        text: 'Maine pichle saal 00:52:34 ka spray kiya tha, yield me 2 quintal ka seedha fayda hua tha.',
        createdAt: new Date(Date.now() - 3600000 * 1)
      }
    ]
  },
  {
    _id: 'post-2',
    authorName: 'Baldev Singh',
    authorRole: 'Farmer',
    title: 'Sarson (Mustard) me aphid / chepa lag raha hai — Organic upaay batayein',
    content: 'Phoolon par halke peele-hare keede chipak rahe hain. Main chemical spray nahi karna chahta kyunki madhumakkhiyan (bees) aati hain.',
    cropTag: 'Mustard (सरसों)',
    category: 'Organic Farming',
    upvotes: 22,
    createdAt: new Date(Date.now() - 3600000 * 18),
    replies: [
      {
        authorName: 'Anil Verma',
        authorRole: 'Agri Expert',
        text: 'Baldev ji, 10,000 PPM Neem Tel (5ml/L) ya Verticillium lecanii bio-fungicide ka spray sham 4 baje ke baad karein jab madhumakkhiyon ki movement kam ho jaye. Yellow sticky traps khet me lagayein.',
        createdAt: new Date(Date.now() - 3600000 * 12)
      }
    ]
  },
  {
    _id: 'post-3',
    authorName: 'Mukesh Choudhary',
    authorRole: 'Farmer',
    title: 'Soybean seed rate aur germination test kaise karein?',
    content: 'Agle Kharif ke liye ghar ka soybean beej store kiya hai. Sowing se pehle kitne daano ka test karna chahiye?',
    cropTag: 'Soybean (सोयाबीन)',
    category: 'General',
    upvotes: 9,
    createdAt: new Date(Date.now() - 3600000 * 36),
    replies: [
      {
        authorName: 'Dr. S.K. Sharma',
        authorRole: 'KVK Scientist',
        text: '100 daane gile jute ke taat me lapet kar 4 din rakhein. Agar 70 se zyada daane ankurit hote hain tabhi buaai karein.',
        createdAt: new Date(Date.now() - 3600000 * 24)
      }
    ]
  }
];

// 1. Get All Posts
exports.getAllPosts = async (req, res) => {
  try {
    const { category, search } = req.query;

    let posts = await CommunityPost.find().sort({ createdAt: -1 });

    if (!posts || posts.length === 0) {
      posts = INITIAL_CHOPAL_POSTS;
    }

    if (category && category !== 'All') {
      posts = posts.filter(p => p.category === category);
    }

    if (search) {
      const q = search.toLowerCase();
      posts = posts.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        p.cropTag.toLowerCase().includes(q)
      );
    }

    res.json({ status: 'success', count: posts.length, posts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Create Post
exports.createPost = async (req, res) => {
  try {
    const { authorName, authorRole, title, content, cropTag, category } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and question content are required' });
    }

    const newPost = new CommunityPost({
      authorName: authorName || 'Kisan Mitra',
      authorRole: authorRole || 'Farmer',
      title: title.trim(),
      content: content.trim(),
      cropTag: cropTag || 'General',
      category: category || 'General',
      upvotes: 0,
      replies: []
    });

    await newPost.save();
    res.status(201).json({ status: 'success', message: 'Post published to Chopal!', post: newPost });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Upvote Post
exports.upvotePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await CommunityPost.findById(id);
    if (post) {
      post.upvotes += 1;
      await post.save();
      return res.json({ status: 'success', upvotes: post.upvotes });
    }

    // fallback for initial sample posts
    const match = INITIAL_CHOPAL_POSTS.find(p => p._id === id);
    if (match) {
      match.upvotes += 1;
      return res.json({ status: 'success', upvotes: match.upvotes });
    }

    res.status(404).json({ error: 'Post not found' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. Add Reply
exports.addReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { authorName, authorRole, text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Reply text is required' });
    }

    const replyObj = {
      authorName: authorName || 'Kisan Mitra',
      authorRole: authorRole || 'Farmer',
      text: text.trim(),
      createdAt: new Date()
    };

    const post = await CommunityPost.findById(id);
    if (post) {
      post.replies.push(replyObj);
      await post.save();
      return res.status(201).json({ status: 'success', replies: post.replies });
    }

    const match = INITIAL_CHOPAL_POSTS.find(p => p._id === id);
    if (match) {
      match.replies.push(replyObj);
      return res.status(201).json({ status: 'success', replies: match.replies });
    }

    res.status(404).json({ error: 'Post not found' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
