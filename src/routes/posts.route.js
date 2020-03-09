import { Router } from 'express';
import PostController from '../controllers/posts.controller';
import auth from '../middleware/auth';

const router = Router();

router.post('/', auth, PostController.createPost);
router.get('/', auth, PostController.getAllPosts);
router.patch('/:id', auth, PostController.updatePost);
router.delete('/:id', auth, PostController.deletePost);

export default router;
