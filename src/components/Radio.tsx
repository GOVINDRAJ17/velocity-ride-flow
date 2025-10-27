import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipForward, SkipBack, Music, Radio as RadioIcon, Podcast } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Radio = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState("Summer Vibes Mix");

  const tracks = [
    { id: 1, title: "Summer Vibes Mix", artist: "DJ Velocity", duration: "45:30", category: "music" },
    { id: 2, title: "Late Night Jazz", artist: "Smooth Sounds", duration: "52:15", category: "music" },
    { id: 3, title: "Tech Talk Daily", artist: "Tech Podcast", duration: "38:20", category: "podcast" },
    { id: 4, title: "Morning News Brief", artist: "News Radio", duration: "25:00", category: "news" },
  ];

  return (
    <section id="radio" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Ride Radio</h2>
          <p className="text-muted-foreground text-lg">Your journey, your soundtrack</p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Now Playing */}
          <Card className="mb-8 shadow-soft border-2 gradient-primary text-white overflow-hidden">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Music size={48} className="text-white" />
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <div className="text-sm opacity-90 mb-1">NOW PLAYING</div>
                  <h3 className="text-2xl font-bold mb-1">{currentTrack}</h3>
                  <p className="opacity-90">DJ Velocity</p>
                  
                  <div className="mt-4 bg-white/20 rounded-full h-2 overflow-hidden">
                    <div className="bg-white h-full w-1/3 rounded-full animate-pulse"></div>
                  </div>
                  
                  <div className="flex justify-between mt-2 text-sm opacity-80">
                    <span>15:30</span>
                    <span>45:30</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-4 mt-6">
                <Button size="icon" variant="ghost" className="text-white hover:bg-white/20 h-12 w-12">
                  <SkipBack size={24} />
                </Button>
                <Button 
                  size="icon" 
                  className="h-16 w-16 rounded-full bg-white text-primary hover:bg-white/90"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause size={28} /> : <Play size={28} />}
                </Button>
                <Button size="icon" variant="ghost" className="text-white hover:bg-white/20 h-12 w-12">
                  <SkipForward size={24} />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Track List */}
          <Tabs defaultValue="music" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="music" className="flex items-center gap-2">
                <Music size={16} />
                Music
              </TabsTrigger>
              <TabsTrigger value="podcast" className="flex items-center gap-2">
                <Podcast size={16} />
                Podcasts
              </TabsTrigger>
              <TabsTrigger value="news" className="flex items-center gap-2">
                <RadioIcon size={16} />
                News
              </TabsTrigger>
            </TabsList>

            <TabsContent value="music" className="space-y-3">
              {tracks
                .filter((t) => t.category === "music")
                .map((track) => (
                  <Card
                    key={track.id}
                    className="cursor-pointer hover:shadow-soft transition-smooth border"
                    onClick={() => setCurrentTrack(track.title)}
                  >
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                          <Music className="text-white" size={20} />
                        </div>
                        <div>
                          <h4 className="font-semibold">{track.title}</h4>
                          <p className="text-sm text-muted-foreground">{track.artist}</p>
                        </div>
                      </div>
                      <div className="text-muted-foreground">{track.duration}</div>
                    </CardContent>
                  </Card>
                ))}
            </TabsContent>

            <TabsContent value="podcast" className="space-y-3">
              {tracks
                .filter((t) => t.category === "podcast")
                .map((track) => (
                  <Card
                    key={track.id}
                    className="cursor-pointer hover:shadow-soft transition-smooth border"
                    onClick={() => setCurrentTrack(track.title)}
                  >
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                          <Podcast className="text-white" size={20} />
                        </div>
                        <div>
                          <h4 className="font-semibold">{track.title}</h4>
                          <p className="text-sm text-muted-foreground">{track.artist}</p>
                        </div>
                      </div>
                      <div className="text-muted-foreground">{track.duration}</div>
                    </CardContent>
                  </Card>
                ))}
            </TabsContent>

            <TabsContent value="news" className="space-y-3">
              {tracks
                .filter((t) => t.category === "news")
                .map((track) => (
                  <Card
                    key={track.id}
                    className="cursor-pointer hover:shadow-soft transition-smooth border"
                    onClick={() => setCurrentTrack(track.title)}
                  >
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                          <RadioIcon className="text-white" size={20} />
                        </div>
                        <div>
                          <h4 className="font-semibold">{track.title}</h4>
                          <p className="text-sm text-muted-foreground">{track.artist}</p>
                        </div>
                      </div>
                      <div className="text-muted-foreground">{track.duration}</div>
                    </CardContent>
                  </Card>
                ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
};

export default Radio;
