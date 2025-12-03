using Jarvice.CommandProcessor;
using Jarvice.CommandProcessor.Configurations;
using Jarvice.CommandProcessor.Interfaces;
using Jarvice.CommandProcessor.Services;
using Jarvice.SpeechService;
using Jarvice.SpeechService.Interfaces;
using Jarvice.SpeechService.Services;
using Jarvice.VoiceListener.Interfaces;
using Jarvice.VoiceListener.Services;
using System.Speech.Synthesis;

IHost host = Host.CreateDefaultBuilder(args)
	.ConfigureServices((context, services) =>
	{
		services.Configure<ServicesUrls>(context.Configuration.GetSection("ServicesUrls"));
		services.Configure<DockerScripts>(context.Configuration.GetSection("DockerScripts"));

		services.AddSingleton<SpeechSynthesizer>();
		services.AddSingleton<IDockerWorkerService, DockerWorkerService>();
		services.AddSingleton<ICommandFactory, CommandFactory>();
		services.AddSingleton<IFileWorkerService, FileWorkerService>();
		services.AddSingleton<IVoiceActionFactory, VoiceActionFactory>();
		services.AddSingleton<ISpeechService, SpeechService>();
		services.AddSingleton<ICommandProcessor, CommandProcessor>();
		services.AddSingleton<IVoiceListener, VoiceListener>();
		services.AddHostedService<JarvisWorker>();
	})
	.Build();

await host.RunAsync();
