// 📁 /routes/stock/controller.js
import StoreService from "./service.js";
import db from "../../databace/db.js";
const service = new StoreService();

res.render("gamedetail", {
  title: "Game Detail",
  activePage: "gamedetail"
});

export const StotrController = {
  
    
};
