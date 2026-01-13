import { Card, CardContent } from "@/components/ui/card"
import { PrimaryBlue } from "@/lib/colors"
import { Check } from "lucide-react"

export default function AutomaticImpact() {
  const amountOptions = [5, 25, 50]

  return (
    <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 py-6 md:py-16 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <h2 className="font-[800] text-foreground mb-4 md:mb-12 text-center text-2xl xs:text-3xl md:text-3xl" style={{ fontSize: 'clamp(1.75rem, 4.5vw, 3rem)' }}>
          One Decision. <span className="text-[#1600ff]">Automatic Impact.</span> Every Cause You Love.
        </h2>

        {/* Three Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-8 mx-4 md:mx-auto max-w-4xl">
          {/* Step 1 */}
          <Card className="rounded-xl shadow-sm">
            <CardContent className="p-2 md:p-4">
              <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2 md:mb-3 mx-auto">
                <span className={`text-[${PrimaryBlue}] text-sm md:text-xl font-bold`}>1</span>
              </div>
              <p className="text-foreground font-[600] mb-2 md:mb-3 text-center text-sm xs:text-base md:text-base">
                Set one monthly amount
              </p>
              <div className="flex flex-wrap gap-1 md:gap-2 justify-center mb-1.5 md:mb-2">
                {amountOptions.map((amount) => (
                  <button
                    key={amount}
                    className={`px-3 py-1.5 md:px-3.5 md:py-2 rounded-full text-xs xs:text-sm md:text-sm font-medium transition-colors ${amount === 5
                        ? "bg-[#1600ff] text-white"
                        : amount === 25
                          ? "bg-[#ff3366] text-white"
                          : "bg-[#a854f7] text-white "
                      }`}
                  >
                    ${amount}
                  </button>
                ))}
              </div>
              <p className="text-muted-foreground text-center text-xs xs:text-sm md:text-sm">
                whatever works for you
              </p>
            </CardContent>
          </Card>

          {/* Step 2 */}
          <Card className="rounded-xl shadow-sm">
            <CardContent className="p-2 md:p-4">
              <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-pink-100 flex items-center justify-center mb-2 md:mb-3 mx-auto">
                <span className="text-pink-500 text-sm md:text-xl font-bold">2</span>
              </div>
              <p className="text-foreground font-[600] text-center text-sm xs:text-base md:text-base">
                Split it across every nonprofit you care about
              </p>
            </CardContent>
          </Card>

          {/* Step 3 */}
          <Card className="rounded-xl shadow-sm">
            <CardContent className="p-2 md:p-4">
              <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-purple-100 flex items-center justify-center mb-2 md:mb-3 mx-auto">
                <span className="text-purple-500 text-sm md:text-xl font-bold">3</span>
              </div>
              <p className="text-foreground font-[600] text-center text-sm xs:text-base md:text-base">
                We handle everything automatically
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Benefits Section */}
        <Card className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-xl mb-4 md:mb-8 mx-4 md:mx-auto md:max-w-[75%]">
          <CardContent className="p-3 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 justify-center items-center gap-2 md:gap-6 mb-3 md:mb-6">
              <div className="flex items-center justify-center md:justify-end gap-1.5 md:gap-2">
                <div className="w-4 h-4 md:w-6 md:h-6 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-700" />
                </div>
                <p className="text-gray-700 font-[600] text-sm xs:text-base md:text-base">
                  No decision fatigue
                </p>
              </div>
              <div className="flex items-center justify-center gap-1.5 md:gap-2">
                <div className="w-4 h-4 md:w-6 md:h-6 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-700" />
                </div>
                <p className="text-gray-700 font-[600] text-sm xs:text-base md:text-base">
                  No guilt
                </p>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-1.5 md:gap-2">
                <div className="w-4 h-4 md:w-6 md:h-6 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-700" />
                </div>
                <p className="text-gray-700 font-[600] text-sm xs:text-base md:text-base">
                  No choosing
                </p>
              </div>
            </div>

            <p className="text-[#1600ff] font-[800] text-center text-lg xs:text-xl md:text-xl" style={{ fontSize: 'clamp(1.125rem, 3vw, 1.5rem)' }}>
              Just set it once, and become someone who actually makes a difference.
            </p>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <div className="flex items-center justify-center gap-1.5 md:gap-2 text-muted-foreground">
          <div className="w-4 h-4 md:w-5 md:h-5 rounded-full border-1 border-green-700 flex items-center justify-center flex-shrink-0">
            <Check className="w-3 h-3 md:w-4 md:h-4 text-green-700" />
          </div>
          <p className="text-xs xs:text-sm md:text-base text-center" style={{ fontSize: 'clamp(0.75rem, 1.5vw, 1rem)' }}>
            Your donations are tax-deductible and you'll receive a consolidated receipt for easy filing
          </p>
        </div>
      </div>
    </div>
  )
}

