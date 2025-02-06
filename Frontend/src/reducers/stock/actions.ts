import { AppThunkAction } from "@store/index";
import { IStockProduct, KnownAction } from "./interface";

export const actionsCreators = {
  GetAllStock: (): AppThunkAction<KnownAction> => async (dispatch) => {
    try {
      const response = await fetch("https://localhost:7159/api/Product");
      if (!response.ok) throw new Error("Erro ao buscar estoque");
      const data: IStockProduct[] = await response.json();

      dispatch({ type: "STOCK_GET_ALL", data });
    } catch (error) {
      console.error("Erro ao carregar estoque:", error);
    }
  },

  AddStock: (id: number, quantityToAdd: number): AppThunkAction<KnownAction> => async (dispatch) => {
    try {
      const response = await fetch(`https://localhost:7159/api/Product/update-stock/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantityToAdd }),
      });

      if (!response.ok) throw new Error("Erro ao adicionar estoque");

      const updatedProduct = await response.json();
      dispatch({ type: "STOCK_UPDATE_PRODUCT", id, quantity: updatedProduct.quantity });
    } catch (error) {
      console.error("Erro ao adicionar estoque:", error);
    }
  },

  DeleteProduct: (id: number): AppThunkAction<KnownAction> => async (dispatch) => {
    try {
      const response = await fetch(`https://localhost:7159/api/Product/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Erro ao excluir o produto");

      dispatch({ type: "STOCK_DELETE_PRODUCT", id });
    } catch (error) {
      console.error("Erro ao excluir o produto:", error);
    }
  },
  
  UpdateStock: (id: number, updatedData: Partial<IStockProduct>): AppThunkAction<KnownAction> => async (dispatch, getState) => {
    try {
      const response = await fetch(`https://localhost:7159/api/Product/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
  
      if (!response.ok) throw new Error("Erro ao atualizar o produto");
  
      const updatedProduct = await response.json();
      const { stockItems } = getState().stock;

      const existingProduct = stockItems.find((item) => item.id === id);
  
      if (!existingProduct) {
        console.error("Produto não encontrado no estado.");
        return;
      }

      const mergedProduct = { ...existingProduct, ...updatedProduct };
 
      dispatch({ type: "STOCK_UPDATE_PRODUCT", id, product: mergedProduct });
    } catch (error) {
      console.error("Erro ao atualizar o produto:", error);
    }
  }  
};
