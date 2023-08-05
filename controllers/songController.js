const asyncHandler = require('express-async-handler');

const Song = require('../models/songModel');
const User = require('../models/userModel');
//@desc Get Songs
//@route GET /api/songs
//@access Private
const getSongs = asyncHandler(async (req, res) => {
    // Get songs where the user id matches or if it is likedBy the user
    let songs = await Song.find({
        $or: [
            { user: req.user.id },
            { likedBy: req.user.id }
        ]
    });
    if(req.params.query){
        const query = req.params.query.toLowerCase();
        if(query === "popularity"){
            songs.sort((a, b) => b.likes - a.likes);
        } else if(query === "recent"){
            songs.sort((a, b) => b.createdAt - a.createdAt);
        } else if(query === "alphabetical"){
            songs.sort((a, b) => a.title.localeCompare(b.title));
        } else if(query === "random") {
            songs.sort((a, b) => 0.5 - Math.random());
        }else if(query === "comments"){
            songs.sort((a, b) => b.comments.length - a.comments.length);
        } else if(query === 'search') {
            console.log(req.body)
            let searchItem = req.body.package;
            songs = songs.filter(song => song.title.toLowerCase().includes(searchItem.toLowerCase()));
        } else if(query === 'tags') {
            if(!req.params.package){
                return res.status(200).json(songs);
            }
            let tags = req.params.package.split(',');
            // remove any tags that are empty
            tags = tags.filter(tag => tag !== '');
            // See if the song has all of the tags if not remove it
            songs = songs.filter(song => {
                let songTags = song.tags.map(tag => tag.toLowerCase());
                let songHasAllTags = true;
                for(let i = 0; i < tags.length; i++){
                    if(!songTags.includes(tags[i].toLowerCase())){
                        songHasAllTags = false;
                    }
                }
                return songHasAllTags;
            })
        }
    }
    res.status(200).json(songs);
    
});
//@desc Set Songs
//@route POST /api/songs
//@access Private
const setSong = asyncHandler (async (req, res) => {
    if(!req.body.title){
        res.status(400);
        throw new Error('No song title provided');
    }
    const song = await Song.create({
        title:req.body.title,
        description: req.body.description,
        likes: 0,
        comments: [],
        link: req.body.link,
        user: req.user.id,
        tags: req.body.tags,
    });
    res.status(200).json(song);
});
//@desc Change Songs
//@route PUT /api/songs/:id
//@access Private
const changeSong = asyncHandler (async (req, res) => {
    console.log("in changeSong");
    console.log(req.body);
    const song = await Song.findById(req.params.id);
    if(!song){
        res.status(404);
        throw new Error('Song not found');
    }
    if(!req.user){
        res.status(404);
        throw new Error('User not found');
    }
    if(song.user.toString() !== req.user.id.toString()){
        res.status(401);
        throw new Error('Not authorized');
    }
    const updatedSong = await Song.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    res.status(200).json(updatedSong);
})
//@desc Delete Songs
//@route DELETE /api/songs/:id
//@access Private
const deleteSong = asyncHandler (async (req, res) => {
    const song = await Song.findById(req.params.id);
    if(!song){
        res.status(404);
        throw new Error('Song not found');
    }
    if(!req.user){
        res.status(404);
        throw new Error('User not found');
    }
    if(song.user.toString() !== req.user.id.toString()){
        res.status(401);
        throw new Error('Not authorized');
    }
    const deletedSong = await Song.deleteOne({ _id: req.params.id });
    if(!deletedSong){
        res.status(404);
        throw new Error('Song not found');
    }
    res.status(200).json({id: req.params.id});
})
//@desc Get Public Songs Songs
//@route GET /api/songs/getPublicSongs
//@access Public
const getPublicSongs = asyncHandler (async (req, res) => {
    let songs = await Song.find({isPrivate: false});
    if(req.params.query){
        const query = req.params.query.toLowerCase();
        console.log(query)
        if(query === "popularity"){
            songs.sort((a, b) => b.likes - a.likes);
        } else if(query === "recent"){
            songs.sort((a, b) => b.createdAt - a.createdAt);
        } else if(query === "alphabetical"){
            songs.sort((a, b) => a.title.localeCompare(b.title));
        } else if(query === "random") {
            songs.sort((a, b) => 0.5 - Math.random());
        } else if(query === "comments"){
            songs.sort((a, b) => b.comments.length - a.comments.length);
        } else if(query === 'search') {
            console.log(req.body)
            let searchItem = req.body.package;
            songs = songs.filter(song => song.title.toLowerCase().includes(searchItem.toLowerCase()));
        } else if(query === 'tags') {
            if(!req.params.package){
                return res.status(200).json(songs);
            }
            let tags = req.params.package.split(',');
            // remove any tags that are empty
            tags = tags.filter(tag => tag !== '');
            // See if the song has all of the tags if not remove it
            songs = songs.filter(song => {
                let songTags = song.tags.map(tag => tag.toLowerCase());
                let songHasAllTags = true;
                for(let i = 0; i < tags.length; i++){
                    if(!songTags.includes(tags[i].toLowerCase())){
                        songHasAllTags = false;
                    }
                }
                return songHasAllTags;
            })
        }
    }
    res.status(200).json(songs);
})
//@desc Get List of Song Ids by user Id
//@route GET /api/songs/getSongIdsByUserId/:id
//@access Private
const getSongIdsByUserId = asyncHandler (async (req, res) => {
    //Only get list of song ids by user id
    const songs = await Song.find({user: req.params.id});
    if(!songs){
        res.status(404);
        throw new Error('No songs found');
    }
    //List of song ids
    let songIds = [];
    for(let i = 0; i < songs.length; i++){
        songIds.push(songs[i]._id);
    }
    res.status(200).json(songIds);
})
//@desc Get song by id
//@route GET /api/songs/getSongById/:id
//@access Private
const getSongById = asyncHandler (async (req, res) => {
    const song = await Song.findById(req.params.id);
    if(!song){
        res.status(404);
        throw new Error('Song not found');
    }
    res.status(200).json(song);
})

//@desc Check if song already exists
//@route GET /api/songs/checkSong/:title/
//@access Public
const checkSong = asyncHandler (async (req, res) => {
    console.log("in check song!")
    if(!req.params.title){
        res.status(400);
        throw new Error('No song title provided');
    }
    let song = await Song.findOne({title: req.params.title.toLowerCase()});
    if(song){
        res.status(200).json({message: 'true'});
    }
    res.status(200).json({message: 'false'});
})

//@desc Get Public Songs Songs
//@route POST /api/songs/like/:id/:userId
//@access Public
const likeSong = asyncHandler (async (req, res) => {
    const song = await Song.findById(req.params.id);
    console.log("song", song);
    if(!song){
        res.status(404);
        throw new Error('Song not found');
    }
    const user = await User.findById(req.params.userId);
    if(!user){
        res.status(404);
        throw new Error('User not found');
    }
    if(song.likedBy.includes(user.id)){
        song.likes--;
        song.likedBy.splice(song.likedBy.indexOf(user.id), 1);
    } else {
        song.likes++;
        song.likedBy.push(req.params.userId);
    }
    const updatedSong = await Song.findByIdAndUpdate(req.params.id, song, {
        new: true,
        runValidators: true
    });
    res.status(200).json(updatedSong);
})
//@desc Get songs and sort it based on query
//@route GET /api/sortCurrentSongs/:query
//@access Public
const sortCurrentSongs = asyncHandler (async (req, res) => {
    // get the current songs and see if they aren't null
    let songs = req.body.songs;
    if(!songs){
        res.status(404);
        throw new Error('Songs not found');
    }
    // sort the songs based on the query
    if(req.params.query === "popularity"){
        songs.sort((a, b) => b.likes - a.likes);
    }
    if(req.params.query === "recent"){
        songs.sort((a, b) => b.createdAt - a.createdAt);
    }
    if(req.params.query === "alphabetical"){
        songs.sort((a, b) => a.title.localeCompare(b.title));
    }
    return res.status(200).json(songs);
})
//@desc Use current songs to filter by tags
//@route GET /api/filterCurrentSongs/:tags
//@access Public
const filterCurrentSongs = asyncHandler (async (req, res) => {
    // get the current songs and see if they aren't null
    console.log('in filter current songs');
    let songs = req.body.songs;
    console.log(songs);
    if(!songs){
        res.status(404);
        throw new Error('Songs not found');
    }
    if(!req.params.tags){
        return res.status(200).json(songs);
    }
    if(req.params.tags === "none"){
        return res.status(200).json(songs);
    }
    // get the tags and see if they aren't null
    let tags = req.params.tags.split(',');
    if(!tags){
        res.status(404);
        throw new Error('Tags not found');
    }
    // remove any tags that are empty
    tags = tags.filter(tag => tag !== '');
    // See if the song has all of the tags if not remove it
    songs = songs.filter(song => {
        let songTags = song.tags.map(tag => tag.toLowerCase());
        let songHasAllTags = true;
        for(let i = 0; i < tags.length; i++){
            if(!songTags.includes(tags[i].toLowerCase())){
                songHasAllTags = false;
            }
        }
        return songHasAllTags;
    })
    return res.status(200).json(songs);
})
//@desc Send public songs in a list of ids
//@route GET /api/getPublicSongsIds/
//@access Public
const getPublicSongsIds = asyncHandler (async (req, res) => {
    const songs = await Song.find({public: true});
    if(!songs){
        res.status(404);
        throw new Error('No songs found');
    }
    let songIds = [];
    for(let i = 0; i < songs.length; i++){
        songIds.push(songs[i]._id);
    }
    res.status(200).json(songIds);
})
//@desc get public songs by id
//@route GET /api/getPublicSongsById/:id
//@access Public
const getPublicSongById = asyncHandler (async (req, res) => {
    const song = await Song.findById(req.params.id);
    if(!song){
        res.status(404);
        throw new Error('Song not found');
    }
    res.status(200).json(song);
})


//@desc Search for songs based on provided songs and query
//@route POST /api/searchCurrentSongs/:query
//@access Public
const searchCurrentSongs = asyncHandler (async (req, res) => {
    // get the current songs and see if they aren't null
    let songs = req.body.songs;
    if(!songs){
        res.status(404);
        throw new Error('Songs not found');
    }
    // search the songs based on the search query
    let searchItem = req.params.query;
    songs = songs.filter(song => song.title.toLowerCase().includes(searchItem.toLowerCase()));
    return res.status(200).json(songs);
})

module.exports = {
    getSongs,
    setSong,
    changeSong,
    deleteSong,
    getPublicSongs,
    likeSong,
    checkSong,
    sortCurrentSongs,
    filterCurrentSongs,
    searchCurrentSongs,
    getSongIdsByUserId,
    getSongById,
    getPublicSongsIds,
    getPublicSongById,
}