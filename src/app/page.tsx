"use client";

import axios from "axios";
import { useState, useEffect, useMemo } from "react";
import debounce from "lodash.debounce";
import { Search, Filter, Loader2, ChevronDown, ChevronUp } from "lucide-react";

interface UserType {
  id: number;
  name: string;
  email: string;
}

export default function Home() {
  const [searchItem, setSearchItem] = useState("");
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [Msg, setMsg] = useState("");
  const [searchColumn, setSearchColumn] = useState("name");
  const [columnAttribute, setcolumnAttribute] = useState([]);
  const [IsFilterOpen, setIsFilterOpen] = useState(false);
  const [hoveredColumn, setHoveredColumn] = useState(null); // in a filter box

  const findAllUsersFromDB = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/api/userdata");
      if (response.data.success) {
        setAllUsers(response.data.data);
        setFilteredUsers(response.data.data);
        setcolumnAttribute(response.data.columnAttributes);
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
        if (!query) {
          setFilteredUsers(allUsers);
          return;
        }

        try {
          const res = await axios.post("/api/searchparam", {
            searchItem: query.trim(),
            SearchColumn: searchColumn,
          });
          setFilteredUsers(res.data.data);
          setcolumnAttribute(res.data.columnAttributes);
          // console.log(res.data.columnAttributes);
          if (res.data.data.length == 0) {
            setMsg("Data not found");
          }
        } catch (error) {
          console.error("Error searching users:", error);
          setFilteredUsers([]);
        }
      }, 300),
    [allUsers, searchColumn]
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchItem(query);
    debouncedSearch(query);
    setMsg("");
  };

  const handleColumnSelectionFilter = (column: string) => {
    setSearchColumn(column);
    debouncedSearch(searchItem);
  };

  const handleSort = async (filter: string, order: string) => {
    try {
      const res = await axios.post("/api/filterData", {
        filterOption: filter,
        order: order,
      });
      setFilteredUsers(res.data.OrderedUsers);
    } catch (error) {
      console.log("Not able to filter data", error);
    } finally {
      setIsFilterOpen(false);
    }
  };

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
          <div className="relative flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsFilterOpen(!IsFilterOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out"
            >
              <Filter className="h-5 w-5" />
              Filter & Sort
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  IsFilterOpen ? "rotate-180" : "rotate-0"
                }`}
              />
            </button>

            {IsFilterOpen && (
              <div className="absolute mt-44 border border-gray-200 rounded-lg shadow-lg right-0 z-10 w-40 bg-white flex flex-col justify-center items-start p-3">
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

        <div className="flex gap-2">
          {columnAttribute.map((column, ind) =>
            ind != 0 ? (
              <button
                type="button"
                key={ind}
                onClick={() => handleColumnSelectionFilter(column)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  searchColumn === column
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {column.charAt(0).toUpperCase() + column.slice(1)}
              </button>
            ) : null
          )}
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
              <tr className="bg-gray-200 border-b border-gray-300">
                {columnAttribute.map((columnHead, index) => (
                  <th
                    key={index}
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    {columnHead}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white w-full">
              {filteredUsers.map((user: UserType) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 border-b border-gray-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {user.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {user.email}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-center text-blue-400">{Msg}</div>
        </div>
      )}
    </div>
  );
}
