using CsvHelper;
using CsvHelper.Configuration;
using Goals.Core.Context;
using Goals.Core.Entities;
using Goals.ParserApp.DTOS;
using System.ComponentModel;
using System;
using System.Globalization;
using static System.Runtime.InteropServices.JavaScript.JSType;
using System.Text.RegularExpressions;

var configuration = new CsvConfiguration(CultureInfo.InvariantCulture)
{
    HeaderValidated = null
};

using (var ctx = new GoalsContext())
{
    ctx.Database.EnsureDeleted();
    ctx.Database.EnsureCreated();

    Console.WriteLine($"{DateTime.Now.ToString("HH:mm:ss")} -- APP STARTED -- ");

    using (var reader = new StreamReader("data.csv"))
    using (var csvReader = new CsvReader(reader, configuration))
    {
        csvReader.Read();
        csvReader.ReadHeader();

        var records = csvReader.GetRecords<GoalReadDto>();

        var goals = new List<Goal>();
        foreach (var x in records)
        {
            var goal = new Goal
            {
                Season = x.Season,
                Competition = x.Competition,
                Matchday = x.Matchday,
                Date = x.Date,
                Venue = x.Venue,
                Club = x.Club,
                Opponent = x.Opponent,
                Result = x.Result,
                Playing_Position = x.Playing_Position,
                Minute = x.Minute,
                At_score = x.At_score,
                Type = x.Type,
                Goal_assist = x.Goal_assist
            };

            ctx.SaveChanges();
            goals.Add(goal);
        }
        ctx.Goals.AddRange(goals);
        ctx.SaveChanges();
        Console.WriteLine($"{DateTime.Now.ToString("HH:mm:ss")} -- GOALS ADDED -- ");
    }
}