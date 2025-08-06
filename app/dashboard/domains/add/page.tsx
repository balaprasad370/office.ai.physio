"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/axios"
import { toast } from "sonner"
import Button from "@/components/atoms/button"
import { Search, ShoppingCart } from "lucide-react"

export default function AddDomain() {
  const [subdomain, setSubdomain] = useState("")
  const [searchResults, setSearchResults] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [isSearching, setIsSearching] = useState(false)

  const router = useRouter()

  const handleSearch = async () => {
    if (!subdomain) return
    setIsSearching(true)

    try {
      const response = await apiClient.get(`/domains/${subdomain}`)
      if (response.data.status) {
        setSearchResults(response.data.data[0])
        setSuggestions([])
      } else {
        setSearchResults(null)
        setSuggestions(response.data.suggestions || [])
      }
    } catch (error) {
      console.error("Error searching domains:", error)
      toast.error("Failed to search domains")
      setSearchResults(null)
      setSuggestions([])
    } finally {
      setIsSearching(false)
    }
  }

  const handlePurchase = async (domain: string, price: number) => {
    try {
      const cartItem = {
        type: "domain",
        domain,
        price,
        quantity: 1,
      }
      const response = await apiClient.post("/v1/cart", cartItem)
      console.log(response.data)
      if (response.data.status) {
        toast.success("Domain added to cart")
        router.push("/dashboard/cart")
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast.error("Failed to add to cart")
    }
  }

  return (
    <div className="container mx-auto min-h-screen max-w-4xl px-4 py-8">
      <div className="bg-n-8 rounded-2xl p-8">
        <div className="flex items-center gap-4 mb-8">
          <ShoppingCart className="h-8 w-8 text-color-1" />
          <h1 className="h3 text-n-1">Domain Search</h1>
        </div>

        <div className="space-y-8">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={subdomain}
                onChange={e => setSubdomain(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                placeholder="Enter domain name"
                className="w-full bg-n-7 border border-n-6 rounded-lg px-4 py-3 text-n-1 focus:outline-none focus:border-color-1"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-n-3">
                .ai.physio
              </span>
            </div>
            <Button
              onClick={handleSearch}
              className="bg-color-1 hover:bg-color-1/90 text-n-1 rounded-lg"
              disabled={!subdomain || isSearching}
            >
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </div>

          {searchResults && searchResults.available && (
            <div className="space-y-4">
              <div className="bg-n-7 rounded-xl p-6 border border-n-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-2">
                    <h3 className="body-1 text-n-1">{searchResults.domain}</h3>
                    <p className="caption text-n-3">
                      Perfect match for your search!
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="body-1 text-color-1">
                      ₹{searchResults.price}
                    </span>
                    <Button
                      onClick={() =>
                        handlePurchase(
                          searchResults.domain,
                          searchResults.price,
                        )
                      }
                      className="bg-color-1 hover:bg-color-1/90 text-n-1"
                    >
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </div>

              {searchResults.alternatives?.map((alt, index) => (
                <div
                  key={index}
                  className="bg-n-7 rounded-xl p-6 border border-n-6"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-2">
                      <h3 className="body-1 text-n-1">{alt.domain}</h3>
                      <p className="caption text-n-3">Alternative option</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="body-1 text-color-1">₹{alt.price}</span>
                      <Button
                        onClick={() => handlePurchase(alt.domain, alt.price)}
                        className="bg-color-1 hover:bg-color-1/90 text-n-1"
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="space-y-4">
              <div className="bg-n-7 rounded-xl p-6 border border-color-3">
                <p className="body-1 text-color-3">
                  Domain not available. Check these alternatives:
                </p>
              </div>

              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="bg-n-7 rounded-xl p-6 border border-n-6"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-2">
                      <h3 className="body-1 text-n-1">{suggestion.domain}</h3>
                      <p className="caption text-n-3">Suggested alternative</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="body-1 text-color-1">
                        ₹{suggestion.price}
                      </span>
                      <Button
                        onClick={() =>
                          handlePurchase(suggestion.domain, suggestion.price)
                        }
                        className="bg-color-1 hover:bg-color-1/90 text-n-1"
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
