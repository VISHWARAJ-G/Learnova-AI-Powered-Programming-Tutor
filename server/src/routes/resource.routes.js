import express from "express";
import { fetchResource } from "../controllers/resource.controller.js";

const router = express.Router();

router.post("/fetch", fetchResource);

export default router;
