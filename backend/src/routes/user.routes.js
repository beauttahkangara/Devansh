import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  addIncome,
  addExpense,
  addIncomeAndExpense,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);

// secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/add-income").post(verifyJWT, addIncome);
router.route("/add-expense").post(verifyJWT, addExpense);
router.route("/add-income-and-expense").post(verifyJWT, addIncomeAndExpense);

export default router;