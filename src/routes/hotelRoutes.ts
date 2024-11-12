// import express, {Router} from 'express';
// import { createHotel, getHotel, updateHotel } from '../controllers/hotelController';

// const router = express.Router();

// router.post('/', createHotel);
// router.get('/:hotelId', getHotel);
// router.put('/:hotelId', updateHotel);

// export default router;


import express from 'express';
import { createHotel, getHotel, updateHotel } from '../controllers/hotelController';

const router = express.Router();

router.post('/', createHotel);
router.get('/:identifier', getHotel);  // Can now handle both ID and slug
router.put('/:hotelId', updateHotel);

export default router;