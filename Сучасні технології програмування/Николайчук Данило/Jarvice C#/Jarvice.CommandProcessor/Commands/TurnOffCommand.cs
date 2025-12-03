using Jarvice.CommandProcessor.Interfaces;
using Jarvice.SpeechService.Enums;
using Jarvice.SpeechService.Interfaces;
using Microsoft.Extensions.Hosting;

namespace Jarvice.CommandProcessor.Commands;

public class TurnOffCommand : ICommand
{
	public string Name => "Turn off the app";

	private readonly IHostApplicationLifetime _appLifetime;
	private readonly ISpeechService _speechService;

	public TurnOffCommand(IHostApplicationLifetime appLifetime,
		ISpeechService speechService)
	{
		_appLifetime = appLifetime;
		_speechService = speechService;
	}

	public async Task ExecuteAsync()
	{
		_speechService.Speak(VoiceResponse.TurnOff);

		await Task.Delay(5000); 

		_appLifetime.StopApplication();
	}
}
