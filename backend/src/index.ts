import express from "express";
import { PORT, COOKIE_TOP_SECRET_KEY } from "./utils/config";
import { initializeDB } from "./utils/db";
import userRouter from "./routes/users";
import loginRouter from "./routes/login";
import refreshRouter from "./routes/refresh";
import logoutRouter from "./routes/logout";
import sellersRouter from "./routes/sellers";
import reviewsRouter from "./routes/reviews";
import productsRouter from "./routes/products";
import mercadoPagoAuthRouter from "./routes/mercadoPagoAuth";
import productHistoryRouter from "./routes/productHistory";
import favoritesRouter from "./routes/favorites";
import cartRouter from "./routes/cart";
import { errorHandler } from "./middleware/errorHandler";
import cookieParser from "cookie-parser";
import { updateOffers } from "./jobs/offersJob";
const app = express();

app.use(express.json());
app.use(cookieParser(COOKIE_TOP_SECRET_KEY));

updateOffers();

app.use("/api/users", userRouter);
app.use("/api/login", loginRouter);
app.use("/api/refresh", refreshRouter);
app.use("/api/logout", logoutRouter);
app.use("/api/sellers", sellersRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/products", productsRouter);
app.use("/api/productHistory", productHistoryRouter);
app.use("/api/oauth/mp", mercadoPagoAuthRouter);
app.use("/api/favorites", favoritesRouter);
app.use("/api/cart", cartRouter);

app.use(errorHandler);

app.listen(PORT, async () => {
  try {
    await initializeDB();
  }
  catch (error) {
    console.log(error);
  }
  console.log(`Listening to PORT: ${PORT}`);
});