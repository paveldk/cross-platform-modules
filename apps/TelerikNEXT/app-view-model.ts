﻿import observable = require("data/observable");
import dialogs = require("ui/dialogs");
var everlive = require("./lib/everlive");

interface ConferenceDay {
    date: Date;
    title: string;
}

interface Speaker {
    //Id: string;
    name: string;
    title: string;
    company: string;
    picture: string;
}

interface Session {
    Id: string;
    title: string;
    start: Date;
    end: Date;
    room: string;
    speakers: Array<Speaker>;
}

var conferenceDays: Array<ConferenceDay> = [
    { title: "WORKSHOPS", date: new Date(2015, 5, 3) },
    { title: "CONFERENCE DAY 1", date: new Date(2015, 5, 4) },
    { title: "CONFERENCE DAY 2", date: new Date(2015, 5, 5) }
];
var sessions: Array<SessionModel> = new Array<SessionModel>();

var el = new everlive("mzacGkKPFlZUfbMq");
var expandExp = {
    "speakers": true
};
el.data('NextSessions').expand(expandExp).get().then(
    function (data) {
        //console.log("Sessions are[" + data.result[1].Data + "]")
        var sessionsFromEvelive: Array<Session> = <Array<Session>> data.result;

        for (var i = 0; i < sessionsFromEvelive.length; i++) {
            sessions.push(new SessionModel(sessionsFromEvelive[i]));
        }
        appModel.onDataLoaded();

    }, function (error) {
        dialogs.alert("Could not load sessions. Error: " + error);
    }
);


export class AppViewModel extends observable.Observable {
    constructor() {
        super();

        this.selectedIndex = 0;
        this.set("isLoading", true);
    }

    private _sessions: Array<SessionModel>;
    get sessions(): Array<SessionModel> {
        return this._sessions;
    }

    get favorites(): Array<SessionModel> {
        return this.sessions.filter(i=> { return i.favorite });
    }

    private _search = "";
    get search(): string {
        return this._search;
    }
    set search(value: string) {
        if (this._search !== value) {
            this._search = value;
            this.notify({ object: this, eventName: observable.knownEvents.propertyChange, propertyName: "search", value: value });

            this.filter();
        }
    }

    private _selectedIndex;
    get selectedIndex(): number {
        return this._selectedIndex;
    }
    set selectedIndex(value: number) {
        if (this._selectedIndex !== value) {
            this._selectedIndex = value;
            this.notify({ object: this, eventName: observable.knownEvents.propertyChange, propertyName: "selectedIndex", value: value });

            this.set("dayHeader", conferenceDays[value].title);

            if (this.search !== "") {
                this.search = "";
            } else {
                this.filter();
            }
        }
    }

    private filter() {
        this._sessions = sessions.filter(s=> {
            return s.start.getDate() === conferenceDays[this.selectedIndex].date.getDate()
                && s.title.toLocaleLowerCase().indexOf(this.search.toLocaleLowerCase()) >= 0;
        });

        this.notify({ object: this, eventName: observable.knownEvents.propertyChange, propertyName: "sessions", value: this._sessions });
    }

    public onDataLoaded() {
        this.set("isLoading", false);
        this.filter();
    }
}

export var appModel = new AppViewModel();

export class SessionModel extends observable.Observable implements Session {
    constructor(source?: Session) {
        super();

        if (source) {
            this._id = source.Id;
            this._title = source.title;
            this._room = source.room;
            this._start = source.start;
            this._end = source.end;
            this._speakers = source.speakers;
        }
    }
    private _id: string;
    private _speakers: Array<Speaker>;
    private _title: string;
    private _start: Date;
    private _end: Date;
    private _room: string;
    private _favorite: boolean;

    get Id(): string {
        return this._id;
    }

    get title(): string {
        return this._title;
    }

    get room(): string {
        return this._room;
    }

    get start(): Date {
        return this._start;
    }

    get end(): Date {
        return this._end;
    }

    get speakers(): Array<Speaker> {
        return this._speakers;
    }

    get range(): string {
        var startMinutes = this.start.getMinutes() + "";
        var endMinutes = this.end.getMinutes() + "";
        var startAM = this.start.getHours() < 12 ? "am" : "pm";
        var endAM = this.end.getHours() < 12 ? "am" : "pm";

        return this.start.getHours() + ':' + (startMinutes.length === 1 ? '0' + startMinutes : startMinutes) + startAM +
            ' - ' + this.end.getHours() + ':' + (endMinutes.length === 1 ? '0' + endMinutes : endMinutes) + endAM;
    }

    get canBeFavorited(): boolean {
        return this.title.indexOf("Registration") === -1 && this.title.indexOf("Lunch") === -1 && this.title.indexOf("PM Break") === -1;
    }

    get favorite(): boolean {
        return this._favorite;
    }
    set favorite(value: boolean) {
        if (this._favorite !== value) {
            this._favorite = value;
            this.notify({ object: this, eventName: observable.knownEvents.propertyChange, propertyName: "favorite", value: this._favorite });
        }
    }
}

//var sessionsOLD: Array<SessionModel> = [
//    new SessionModel({
//        title: "Registration",
//        start: new Date(2015, 5, 3, 8, 30),
//        end: new Date(2015, 5, 3, 9, 30),
//        room: ""
//    }),
//    new SessionModel({
//        title: "NativeScript Deep Dive",
//        start: new Date(2015, 5, 3, 9, 30),
//        end: new Date(2015, 5, 3, 12, 30),
//        room: "Workshop Room 1"
//    }),
//    new SessionModel({
//        title: "Smart Design for Smartphones",
//        start: new Date(2015, 5, 3, 9, 30),
//        end: new Date(2015, 5, 3, 12, 30),
//        room: "Workshop Room 2"
//    }),
//    new SessionModel({
//        title: "Modern .NET Apps!",
//        start: new Date(2015, 5, 3, 9, 30),
//        end: new Date(2015, 5, 3, 12, 30),
//        room: "Workshop Room 3"
//    }),
//    new SessionModel({
//        title: "Telerik Sitefinity as a Data Integration Platform",
//        start: new Date(2015, 5, 3, 9, 30),
//        end: new Date(2015, 5, 3, 12, 30),
//        room: "Workshop Room 4"
//    }),
//    new SessionModel({
//        title: "Lunch",
//        start: new Date(2015, 5, 3, 9, 30),
//        end: new Date(2015, 5, 3, 12, 30),
//        room: ""
//    }),
//    new SessionModel({
//        title: "NativeScript Deep Dive",
//        start: new Date(2015, 5, 3, 13, 30),
//        end: new Date(2015, 5, 3, 16, 30),
//        room: "Workshop Room 1"
//    }),
//    new SessionModel({
//        title: "Smart Design for Smartphones",
//        start: new Date(2015, 5, 3, 13, 30),
//        end: new Date(2015, 5, 3, 16, 30),
//        room: "Workshop Room 2"
//    }),
//    new SessionModel({
//        title: "Responsive Apps with Telerik DevCraft",
//        start: new Date(2015, 5, 3, 13, 30),
//        end: new Date(2015, 5, 3, 16, 30),
//        room: "Workshop Room 3"
//    }),
//    new SessionModel({
//        title: "ASP .NET MVC Development in Telerik Sitefinity",
//        start: new Date(2015, 5, 3, 13, 30),
//        end: new Date(2015, 5, 3, 16, 30),
//        room: "Workshop Room 4"
//    }), new SessionModel({
//        title: "Registration",
//        start: new Date(2015, 5, 4, 7, 30),
//        end: new Date(2015, 5, 4, 9, 0),
//        room: ""
//    }), new SessionModel({
//        title: "Telerik Keynote",
//        start: new Date(2015, 5, 4, 9, 0),
//        end: new Date(2015, 5, 4, 10, 30),
//        room: "General Session"
//    }), new SessionModel({
//        title: "A Lap Around NativeScript",
//        start: new Date(2015, 5, 4, 10, 45),
//        end: new Date(2015, 5, 4, 11, 30),
//        room: "Conference Room 1"
//    }), new SessionModel({
//        title: "Kendo UI Building Blocks",
//        start: new Date(2015, 5, 4, 10, 45),
//        end: new Date(2015, 5, 4, 11, 30),
//        room: "Conference Room 2"
//    }), new SessionModel({
//        title: "CRUD with ASP.NET MVC, Web API, EF and Kendo UI",
//        start: new Date(2015, 5, 4, 10, 45),
//        end: new Date(2015, 5, 4, 11, 30),
//        room: "Conference Room 3"
//    }), new SessionModel({
//        title: "Best Practices for Understanding and Implementing Website Project Requirements",
//        start: new Date(2015, 5, 4, 10, 45),
//        end: new Date(2015, 5, 4, 11, 30),
//        room: "Conference Room 4"
//    }), new SessionModel({
//        title: "Getting Started with ScreenBuilder",
//        start: new Date(2015, 5, 4, 11, 45),
//        end: new Date(2015, 5, 4, 12, 30),
//        room: "Conference Room 1"
//    }), new SessionModel({
//        title: "Getting Started with AngularJS",
//        start: new Date(2015, 5, 4, 11, 45),
//        end: new Date(2015, 5, 4, 12, 30),
//        room: "Conference Room 2"
//    }), new SessionModel({
//        title: "Zero to Hipster with the M.I.K.E. Stack",
//        start: new Date(2015, 5, 4, 11, 45),
//        end: new Date(2015, 5, 4, 12, 30),
//        room: "Conference Room 3"
//    }), new SessionModel({
//        title: "Content Meets Commerce, Email and Analytics to Build the New Data-Driven Marketing Machine",
//        start: new Date(2015, 5, 4, 11, 45),
//        end: new Date(2015, 5, 4, 12, 30),
//        room: "Conference Room 4"
//    }), new SessionModel({
//        title: "Lunch",
//        start: new Date(2015, 5, 4, 12, 30),
//        end: new Date(2015, 5, 4, 13, 30),
//        room: ""
//    }), new SessionModel({
//        title: "Hybrid vs Native vs Web: Which is Right for Me?",
//        start: new Date(2015, 5, 4, 13, 30),
//        end: new Date(2015, 5, 4, 14, 15),
//        room: "Conference Room 1"
//    }), new SessionModel({
//        title: "AngularJS Directives For Kendo UI",
//        start: new Date(2015, 5, 4, 13, 30),
//        end: new Date(2015, 5, 4, 14, 15),
//        room: "Conference Room 2"
//    }), new SessionModel({
//        title: "Using Kendo UI in SharePoint/Office 365",
//        start: new Date(2015, 5, 4, 13, 30),
//        end: new Date(2015, 5, 4, 14, 15),
//        room: "Conference Room 3"
//    }), new SessionModel({
//        title: "Develop the Next Generation of Content-Driven Mobile Apps",
//        start: new Date(2015, 5, 4, 13, 30),
//        end: new Date(2015, 5, 4, 14, 15),
//        room: "Conference Room 3"
//    }), new SessionModel({
//        title: "PM Break",
//        start: new Date(2015, 5, 4, 14, 15),
//        end: new Date(2015, 5, 4, 14, 30),
//        room: ""
//    }), new SessionModel({
//        title: "AppBuilder in 45 Minutes",
//        start: new Date(2015, 5, 4, 14, 30),
//        end: new Date(2015, 5, 16, 15, 15),
//        room: "Conference Room 1"
//    }), new SessionModel({
//        title: "Mastering JavaScript",
//        start: new Date(2015, 5, 4, 14, 30),
//        end: new Date(2015, 5, 16, 15, 15),
//        room: "Conference Room 2"
//    }), new SessionModel({
//        title: "Building Mobile Apps with Visual Studio",
//        start: new Date(2015, 5, 4, 14, 30),
//        end: new Date(2015, 5, 16, 15, 15),
//        room: "Conference Room 3"
//    }), new SessionModel({
//        title: "Building a CRM Portal in 60 Minutes",
//        start: new Date(2015, 5, 4, 14, 30),
//        end: new Date(2015, 5, 16, 15, 15),
//        room: "Conference Room 4"
//    }), new SessionModel({
//        title: "NativeScript Extensibility",
//        start: new Date(2015, 5, 4, 15, 30),
//        end: new Date(2015, 5, 4, 16, 15),
//        room: "Conference Room 1"
//    }), new SessionModel({
//        title: "There's a Cordova Plugin for that!",
//        start: new Date(2015, 5, 4, 15, 30),
//        end: new Date(2015, 5, 4, 16, 15),
//        room: "Conference Room 2"
//    }), new SessionModel({
//        title: "AngularJS and Kendo UI",
//        start: new Date(2015, 5, 4, 15, 30),
//        end: new Date(2015, 5, 4, 16, 15),
//        room: "Conference Room 3"
//    }), new SessionModel({
//        title: "Continuous Delivery and Telerik Sitefinity",
//        start: new Date(2015, 5, 4, 15, 30),
//        end: new Date(2015, 5, 4, 16, 15),
//        room: "Conference Room 4"
//    }), new SessionModel({
//        title: "Telerik Leadership Panel - Q&A",
//        start: new Date(2015, 5, 4, 16, 30),
//        end: new Date(2015, 5, 4, 17, 15),
//        room: "Conference Room 1"
//    }), new SessionModel({
//        title: "Accelerate your Agile Adoption",
//        start: new Date(2015, 5, 4, 16, 30),
//        end: new Date(2015, 5, 4, 17, 15),
//        room: "Conference Room 2"
//    }), new SessionModel({
//        title: "No Kidding, Real World Tester/Developer Collaboration",
//        start: new Date(2015, 5, 4, 16, 30),
//        end: new Date(2015, 5, 4, 17, 15),
//        room: "Conference Room 3"
//    }), new SessionModel({
//        title: "Sitefinity",
//        start: new Date(2015, 5, 4, 16, 30),
//        end: new Date(2015, 5, 4, 17, 15),
//        room: "Conference Room 4"
//    }), new SessionModel({
//        title: "Attendee Appreciation Party",
//        start: new Date(2015, 5, 4, 19, 0),
//        end: new Date(2015, 5, 4, 22, 30),
//        room: ""
//    }), new SessionModel({
//        title: "Registration",
//        start: new Date(2015, 5, 5, 8, 0),
//        end: new Date(2015, 5, 5, 9, 0),
//        room: ""
//    }), new SessionModel({
//        title: "Sitefinity Keynote",
//        start: new Date(2015, 5, 5, 9, 0),
//        end: new Date(2015, 5, 5, 10, 30),
//        room: "General Session"
//    }), new SessionModel({
//        title: "Introduction to Mobile Testing and Device Cloud",
//        start: new Date(2015, 5, 5, 10, 45),
//        end: new Date(2015, 5, 5, 11, 30),
//        room: "Conference Room 1"
//    }), new SessionModel({
//        title: "Data is Beautiful with Kendo UI DataViz",
//        start: new Date(2015, 5, 5, 10, 45),
//        end: new Date(2015, 5, 5, 11, 30),
//        room: "Conference Room 2"
//    }), new SessionModel({
//        title: "Mastering How to Visualize Data in ASP.NET MVC",
//        start: new Date(2015, 5, 5, 10, 45),
//        end: new Date(2015, 5, 5, 11, 30),
//        room: "Conference Room 3"
//    }), new SessionModel({
//        title: "Using Sitefinity to Power Web 3.0 Experiences",
//        start: new Date(2015, 5, 5, 10, 45),
//        end: new Date(2015, 5, 5, 11, 30),
//        room: "Conference Room 4"
//    }), new SessionModel({
//        title: "Building Offline-Ready Mobile Apps",
//        start: new Date(2015, 5, 5, 11, 45),
//        end: new Date(2015, 5, 5, 12, 30),
//        room: "Conference Room 1"
//    }), new SessionModel({
//        title: "Kendo UI Mobile: What It Can And Can't Do For You",
//        start: new Date(2015, 5, 5, 11, 45),
//        end: new Date(2015, 5, 5, 12, 30),
//        room: "Conference Room 2"
//    }), new SessionModel({
//        title: "ASP.NET with Telerik UI!",
//        start: new Date(2015, 5, 5, 11, 45),
//        end: new Date(2015, 5, 5, 12, 30),
//        room: "Conference Room 3"
//    }), new SessionModel({
//        title: "Cross-Channel Data Integration with Digital Experience Cloud",
//        start: new Date(2015, 5, 5, 11, 45),
//        end: new Date(2015, 5, 5, 12, 30),
//        room: "Conference Room 4"
//    }), new SessionModel({
//        title: "Lunch",
//        start: new Date(2015, 5, 5, 12, 30),
//        end: new Date(2015, 5, 5, 13, 30),
//        room: ""
//    }), new SessionModel({
//        title: "Performance Tuning Your Mobile Web Apps",
//        start: new Date(2015, 5, 5, 13, 30),
//        end: new Date(2015, 5, 5, 14, 15),
//        room: "Conference Room 1"
//    }), new SessionModel({
//        title: "Improving Applications with Telerik Analytics",
//        start: new Date(2015, 5, 5, 13, 30),
//        end: new Date(2015, 5, 5, 14, 15),
//        room: "Conference Room 2"
//    }), new SessionModel({
//        title: "Reporting vs Dashboards vs UI Data Apps",
//        start: new Date(2015, 5, 5, 13, 30),
//        end: new Date(2015, 5, 5, 14, 15),
//        room: "Conference Room 3"
//    }), new SessionModel({
//        title: "Modern MVC and Front-End Development with Telerik Sitefinity",
//        start: new Date(2015, 5, 5, 13, 30),
//        end: new Date(2015, 5, 5, 14, 15),
//        room: "Conference Room 4"
//    }), new SessionModel({
//        title: "PM Break",
//        start: new Date(2015, 5, 5, 14, 15),
//        end: new Date(2015, 5, 5, 14, 30),
//        room: ""
//    }), new SessionModel({
//        title: "Telerik Native Mobile UI for iOS and Android",
//        start: new Date(2015, 5, 5, 14, 30),
//        end: new Date(2015, 5, 17, 15, 15),
//        room: "Conference Room 1"
//    }), new SessionModel({
//        title: "IoT and the Telerik Platform",
//        start: new Date(2015, 5, 5, 14, 30),
//        end: new Date(2015, 5, 17, 15, 15),
//        room: "Conference Room 2"
//    }), new SessionModel({
//        title: "Debugging with Fiddler",
//        start: new Date(2015, 5, 5, 14, 30),
//        end: new Date(2015, 5, 17, 15, 15),
//        room: "Conference Room 3"
//    }), new SessionModel({
//        title: "Anticipating & Planning of Peak Online Traffic for Professional Football's Biggest Games",
//        start: new Date(2015, 5, 5, 14, 30),
//        end: new Date(2015, 5, 17, 15, 15),
//        room: "Conference Room 4"
//    }), new SessionModel({
//        title: "Building a Mobile App API using MongoDB and Node.js",
//        start: new Date(2015, 5, 5, 15, 30),
//        end: new Date(2015, 5, 5, 16, 15),
//        room: "Conference Room 1"
//    }), new SessionModel({
//        title: "Advanced Kendo UI",
//        start: new Date(2015, 5, 5, 15, 30),
//        end: new Date(2015, 5, 5, 16, 15),
//        room: "Conference Room 2"
//    }), new SessionModel({
//        title: "Building Touch Apps with UI for WPF",
//        start: new Date(2015, 5, 5, 15, 30),
//        end: new Date(2015, 5, 5, 16, 15),
//        room: "Conference Room 3"
//    }), new SessionModel({
//        title: "Making the Most Out of Sitefinity Personalization",
//        start: new Date(2015, 5, 5, 15, 30),
//        end: new Date(2015, 5, 5, 16, 15),
//        room: "Conference Room 4"
//    }), new SessionModel({
//        title: "Closing Keynote",
//        start: new Date(2015, 5, 5, 16, 30),
//        end: new Date(2015, 5, 5, 17, 15),
//        room: "General Session"
//    })];

//var speakersOLD: Array<Speaker> = [
//    {
//        name: "Todd Anglin",
//        title: "Vice President of Product Strategy",
//        company: "Telerik",
//        picture: "~/app/images/todd.png"
//    },
//    {
//        name: "Aaron Mahimainathan",
//        title: "Senior Vice President, Platform & Tools",
//        company: "Telerik",
//        picture: "~/app/images/aaron.png"
//    },
//    {
//        name: "Burke Holland",
//        title: "Director of Developer Relations",
//        company: "Telerik",
//        picture: "~/app/images/burke.png"
//    },
//    {
//        name: "Brian Rinaldi",
//        title: "Developer Content Manager",
//        company: "Telerik",
//        picture: "~/app/images/brian.png"
//    },
//    {
//        name: "TJ VanToll",
//        title: "Senior Developer Advocate",
//        company: "Telerik",
//        picture: "~/app/images/tj.png"
//    },
//    {
//        name: "Jen Looper",
//        title: "Developer Advocate",
//        company: "Telerik",
//        picture: "~/app/images/jen.png"
//    },
//    {
//        name: "Brandon Satrom",
//        title: "Director of Product Management",
//        company: "Telerik",
//        picture: "~/app/images/brandon.png"
//    },
//    {
//        name: "Michael Crump",
//        title: "Senior Developer Advocate",
//        company: "Telerik",
//        picture: "~/app/images/michael.png"
//    },
//    {
//        name: "Sam Basu",
//        title: "Developer Advocate",
//        company: "Telerik",
//        picture: "~/app/images/sam.png"
//    },
//    {
//        name: "Svetla Yankova",
//        title: "Product Marketing Manager",
//        company: "Telerik",
//        picture: "~/app/images/svetla.png"
//    }];
