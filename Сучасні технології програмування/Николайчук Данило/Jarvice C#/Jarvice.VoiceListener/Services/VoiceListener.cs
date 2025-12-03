using Jarvice.CommandProcessor.Interfaces;
using Jarvice.SpeechService.Enums;
using Jarvice.SpeechService.Interfaces;
using Jarvice.VoiceListener.Interfaces;
using System.Speech.Recognition;

namespace Jarvice.VoiceListener.Services;

public class VoiceListener : IVoiceListener
{
	private readonly ICommandProcessor _commandProcessor;
	private readonly ISpeechService _speechService;
	private CancellationTokenSource? _activeListeningCts;

	private SpeechRecognitionEngine _engine;
	private bool _isActiveListening;

	public event Action<string>? OnCommandDetected;
	public event Action? OnWakeWordDetected;

	private Grammar _wakeWordGrammar;
	private Grammar _commandGrammar;

	public VoiceListener(ICommandProcessor commandProcessor,
		ISpeechService speechService,
		ICommandFactory commandFactory)
	{
		_commandProcessor = commandProcessor;
		_speechService = speechService;

		_engine = new SpeechRecognitionEngine(new System.Globalization.CultureInfo("en-US"));
		_engine.SetInputToDefaultAudioDevice();

		// Wake words
		var wakeWords = new Choices("Jarvis", "Hey Jarvis");
		var wakeBuilder = new GrammarBuilder(wakeWords) { Culture = new System.Globalization.CultureInfo("en-US") };
		_wakeWordGrammar = new Grammar(wakeBuilder);

		// Commands
		var commands = new Choices(commandFactory.AllCommandNames().ToArray());

		var commandBuilder = new GrammarBuilder(commands) { Culture = new System.Globalization.CultureInfo("en-US") };
		_commandGrammar = new Grammar(commandBuilder);

		// Start with wake-word grammar
		_engine.LoadGrammar(_wakeWordGrammar);
		_engine.SpeechRecognized += OnSpeechRecognized;
	}

	public Task StartAsync(CancellationToken cancellationToken)
	{
		_engine.RecognizeAsync(RecognizeMode.Multiple);
		Console.WriteLine("Voice listener started...");
		return Task.CompletedTask;
	}

	public Task StopAsync(CancellationToken cancellationToken)
	{
		_engine.RecognizeAsyncStop();
		Console.WriteLine("Voice listener stopped...");
		return Task.CompletedTask;
	}

	private async void OnSpeechRecognized(object? sender, SpeechRecognizedEventArgs e)
	{
		var text = e.Result.Text.ToLowerInvariant();

		if (!_isActiveListening && (text.Contains("jarvis") || text.Contains("hey jarvis")))
		{
			_isActiveListening = true;
			OnWakeWordDetected?.Invoke();
			Console.WriteLine($"Wake word detected: {text}");
			_speechService.Speak(VoiceResponse.YesSir);

			_engine.UnloadAllGrammars();
			_engine.LoadGrammar(_commandGrammar);

			StartActiveListeningTimer();
		}
		else if (_isActiveListening)
		{
			await _commandProcessor.ProcessCommand(text);

			StartActiveListeningTimer();
		}
	}

	private void StartActiveListeningTimer()
	{
		_activeListeningCts?.Cancel();

		_activeListeningCts = new CancellationTokenSource();
		var token = _activeListeningCts.Token;

		_ = Task.Run(async () =>
		{
			try
			{
				await Task.Delay(10000, token);

				_isActiveListening = false;
				_engine.UnloadAllGrammars();
				_engine.LoadGrammar(_wakeWordGrammar);

				Console.WriteLine("Returning to wake-word listening...");
			}
			catch (TaskCanceledException)
			{
			}
		});
	}
}
