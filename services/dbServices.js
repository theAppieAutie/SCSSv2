// imports

const {Pool} = require('pg');

// Set up connection to DB and CRUD ops
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });
  
pool.connect()
    .then(() => console.log('Connected to PostgreSQL'))
    .catch(err => console.error("Connection error", err.stack));


const insertParticipant = async (username, condition, groupNumber, censoredInfo) => {
    const client = await pool.connect();
    try {
        const query = 'INSERT INTO participants (condition, group_number, censorship_group, experiment_start_time) VALUES ($1, $2, $3, $4) RETURNING participant_id;';
        const time = new Date().toISOString();
        const values = [condition, groupNumber, censoredInfo, time];
        const result = await client.query(query, values);
        // return result.rows[0].participant_id;
    } finally {
        client.release();
    }

};

const getNextId = async () => {
    const client = await pool.connect();
    try {
        const query = 'SELECT MAX(participant_id) AS max_id FROM participants;'
        const result = await client.query(query);
        const maxId = result.rows[0].max_id;
        return maxId !== null ? Number(maxId) + 1 : 1;
    } finally {
        client.release();
    }

};

const insertTrial = async (participant, type, number, start, end, url) => {
    const client = await pool.connect();
    try {
        const query = 'INSERT INTO trials (participant_id, trial_type, trial_number, start_time, end_time, video_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING trial_id;';
        const values = [participant, type, number, start, end, url];
        const result = await client.query(query, values);
        return result.rows[0].trial_id;
    } finally {
        client.release();
    }
};

const insertPacket = async (trial, user, advisor, accepted, time) => {
    const client = await pool.connect();
    try {
        const query = 'INSERT INTO packets (trial_id, user_input, advisor_recommendation, accepted, classified_time) VALUES ($1, $2, $3, $4, $5);';
        const values = [trial, user, advisor, accepted, time];
        const result = await client.query(query, values);
        // return result.rows[0].trial_id;
    } catch (err) {
        console.error("coulnt add packet input", err.stack); 
    } finally {
        client.release();
    }
};

const insertScale = async (participant, type, phase) => {
   
    const client = await pool.connect();
    try {
        const query = 'INSERT INTO scales (participant_id, scale_type, scale_phase) VALUES ($1, $2, $3) RETURNING scale_id;';
        const values = [participant, type, phase];
        const result = await client.query(query, values);
        return result.rows[0].scale_id;
    } finally {
        client.release();
    }
};

const insertItem = async (itemNumber, scale, value) => {
 
    const client = await pool.connect();
    try {
        const query = 'INSERT INTO items (item_id, scale_id, item_value) VALUES ($1, $2, $3);';
        const values = [itemNumber, scale, value];
        const result = await client.query(query, values);
    } finally {
        client.release();
    }
};

const insertFeedback = async (participant, feedback) => {
    const client = await pool.connect();
    try {
        const query = 'UPDATE participants SET feedback = $2 WHERE participant_id = $1;';
        const values = [participant, feedback];
        const result = await client.query(query, values);
    } finally {
        client.release();
    }
};

const dbServices = {
    insertFeedback,
    insertItem,
    insertScale,
    insertPacket,
    insertTrial,
    insertParticipant,
    getNextId,
};

module.exports =   dbServices;