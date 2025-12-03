using Jarvice.SpeechService.Actions;
using Jarvice.SpeechService.Enums;
using Jarvice.SpeechService.Interfaces;
using System.Speech.Synthesis;

namespace Jarvice.SpeechService;

public class VoiceActionFactory : IVoiceActionFactory
{
	private readonly SpeechSynthesizer _synthesizer;
	private readonly string _basePath;

	public VoiceActionFactory(SpeechSynthesizer synthesizer)
	{
		_synthesizer = synthesizer;
		_basePath = AppDomain.CurrentDomain.BaseDirectory + "Files\\";
	}

	public IVoiceAction GetAction(VoiceResponse response)
	{
		return response switch
		{
			VoiceResponse.WelcomeSir => new FileVoiceAction("Files\\Start-of-system.wav"),
			VoiceResponse.YesSir => new RandomFileVoiceAction(
				"Files\\Yes_sir.wav",
				"Files\\What-do-you-need-Sir.wav",
				"Files\\how-can-i-help-you.wav",
				"Files\\at-your-service-sir.wav"
			),
			VoiceResponse.None => new TtsAction(_synthesizer),
			VoiceResponse.HereItIsItWasAlreadyOpened => new FileVoiceAction("Files\\Here-it-is_-it-was-already-opened.wav"),
			VoiceResponse.ProcessStartedSolutionIsOpening => new FileVoiceAction("Files\\Process-started-solution-is-opening.wav"),
			VoiceResponse.TurnOff => new FileVoiceAction("Files\\turning-off.wav"),
			VoiceResponse.CloseService => new FileVoiceAction("Files\\close-service.wav"),
			_ => new TtsAction(_synthesizer)
		};
	}
}
