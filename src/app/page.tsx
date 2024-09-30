"use client";

import axios from "axios";
import { useState, useEffect, useMemo, useCallback } from "react";
import debounce from "lodash.debounce";
import {
  Search,
  Filter,
  Loader2,
  ChevronDown,
  ChevronUp,
  Delete,
} from "lucide-react";
import { toast } from "react-toastify";

interface UserType {
  id: number;
  name: string;
  email: string;
}

export default function Home() {
  const [searchItem, setSearchItem] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [searchColumn, setSearchColumn] = useState("name");
  const [columnAttribute, setColumnAttribute] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);

  const [lastFetchedData, setlastFetchedData] = useState<UserType[]>([]);

  const findAllUsersFromDB = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get("/api/userdata");
      if (data.success) {
        setFilteredUsers(data.data);
        setColumnAttribute(data.columnAttributes);

        setlastFetchedData(data.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedSearch = useMemo(
    () =>
      debounce(async (query: string) => {
        setMsg("");
        if (!query) {
          // findAllUsersFromDB();
          setFilteredUsers(lastFetchedData);
          return;
        }

        try {
          const res = await axios.post("/api/searchparam", {
            searchItem: query.trim(),
            SearchColumn: searchColumn,
          });

          setFilteredUsers(res.data.data);
          setColumnAttribute(res.data.columnAttributes);
          setMsg(res.data.data.length === 0 ? "Data not found" : "");
        } catch (error) {
          console.error("Error searching users:", error);
          setFilteredUsers([]);
          setMsg("Data not found");
        }
      }, 500),
    [searchColumn, lastFetchedData]
  );

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      setSearchItem(query);
      debouncedSearch(query);
    },
    [debouncedSearch, setSearchItem]
  );

  const handleColumnSelectionFilter = useCallback(
    (column: string) => {
      setSearchColumn(column);
      // debouncedSearch(searchItem);
    },
    [setSearchColumn]
  );

  const handleSort = useCallback(
    async (filter: string, order: string) => {
      // filter on the basis of ID , Name , or Email
      try {
        setIsFilterOpen(false);
        const { data } = await axios.post("/api/filterData", {
          filterOption: filter,
          order: order,
        });

        setFilteredUsers(data.OrderedUsers);
      } catch (error) {
        console.error("Error sorting data", error);
      }
    },
    [setFilteredUsers]
  );

  const deleteThisData = useCallback(async (id: number) => {
    try {
      const res = await axios.delete("/api/userdata", {
        data: { dataId: id },
      });
      if (res.data.success) {
        findAllUsersFromDB();
        toast.success("Record deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting data", error);
    }
  }, []);

  useEffect(() => {
    findAllUsersFromDB();
  }, []);

  return (
    <div className="container mx-auto p-4 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">User Search</h1>

      <div className="mb-6 bg-white p-4 rounded-lg shadow-md flex flex-col gap-5">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search users..."
              value={searchItem}
              onChange={handleSearch}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          <div className="relative items-center gap-4 ">
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out"
            >
              <Filter className="h-5 w-5" />
              <p className="hidden sm:block">Filter & Sort</p>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  isFilterOpen ? "rotate-180" : "rotate-0"
                }`}
              />
            </button>

            {isFilterOpen && (
              <div className="absolute mt-2 border border-gray-200 rounded-lg shadow-lg right-0 z-10 w-40 bg-white flex flex-col justify-center items-start p-3">
                {columnAttribute.map((column) => (
                  <div
                    key={column}
                    className="w-full relative"
                    onMouseEnter={() => setHoveredColumn(column)}
                    onMouseLeave={() => setHoveredColumn(null)}
                  >
                    <button
                      type="button"
                      className="w-full text-black text-left px-2 py-1 hover:bg-gray-100 rounded-md transition-colors duration-150"
                    >
                      {column.charAt(0).toUpperCase() + column.slice(1)}
                    </button>

                    {hoveredColumn === column && (
                      <div className="absolute z-10 text-black top-0 ml-20 w-20 bg-white border border-gray-200 rounded-lg shadow-lg">
                        <button
                          type="button"
                          className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded-t-md transition-colors duration-150"
                          onClick={() => handleSort(column, "asc")}
                        >
                          <ChevronUp className="inline-block mr-1 h-4 w-4" />
                          Asc
                        </button>
                        <button
                          type="button"
                          className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded-b-md transition-colors duration-150"
                          onClick={() => handleSort(column, "desc")}
                        >
                          <ChevronDown className="inline-block mr-1 h-4 w-4" />
                          Desc
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 sm:gap-4 items-center p-1 ">
          <div className=" hidden sm:block text-xl font-semibold text-gray-800">
            🔍 Select the Column to Discover:
          </div>
          {columnAttribute.map((column, ind) => (
            <button
              type="button"
              key={ind}
              onClick={() => handleColumnSelectionFilter(column)}
              className={`px-4 py-2 text-sm font-medium rounded-full border-2 transition-all duration-300 ease-in-out transform hover:scale-105 ${
                searchColumn === column
                  ? " bg-blue-500 text-white shadow-md"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {column.charAt(0).toUpperCase() + column.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-200 border-b border-gray-300 text-black">
                {columnAttribute.map((columnHead, index) => (
                  <th
                    key={index}
                    className="py-2 px-4 text-left text-gray-800 font-semibold"
                  >
                    {columnHead.charAt(0).toUpperCase() +
                      columnHead.slice(1).toLowerCase()}
                  </th>
                ))}
                <th className="py-2 px-4 text-left text-gray-800 font-semibold">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="text-black">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b">
                  {Object.values(user).map((value, i) => (
                    <td key={i} className="py-2 px-4">
                      {value}
                    </td>
                  ))}
                  <td className="py-2 px-4">
                    <button
                      type="button"
                      className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-lg"
                      onClick={() => deleteThisData(user.id)}
                    >
                      <Delete className="h-4 w-4 inline-block" />
                      {}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {msg.length > 0 && (
        <div className="mt-4 text-center text-red-500 text-lg font-semibold">
          {msg}
        </div>
      )}
    </div>
  );
}
