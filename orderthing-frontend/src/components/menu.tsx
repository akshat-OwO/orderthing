import axios from "@/lib/axios.config";
import { TItemsSchema } from "@/lib/schemas/items";
import { useQuery } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import { Loader } from "lucide-react";
import ItemCard from "./item-card";

const Menu = () => {
    const { data, isLoading } = useQuery({
        queryKey: ["items"],
        queryFn: async () => {
            const response: AxiosResponse<TItemsSchema> =
                await axios.get("/items");
            return response.data;
        },
    });
    return (
        <div className="flex-1 py-10 md:px-10 flex flex-col gap-5">
            <div className="flex justify-between items-center">
                <h3 className="text-3xl font-semibold">Menu</h3>
            </div>
            {isLoading && (
                <div className="pt-10 flex justify-center items-center">
                    <Loader className="size-10 animate-spin" />
                </div>
            )}
            {data && data.items && data.items.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {data.items.map((item) => (
                        <ItemCard key={item.id} item={item} mode="view" />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Menu;
